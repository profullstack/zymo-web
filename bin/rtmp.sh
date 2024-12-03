#!/bin/bash

# Configuration
VIDEO_LIST="$HOME/videos/playlist.txt"
STATE_FILE="$HOME/videos/rtmp_state.txt"
PIPE="$HOME/videos/video_pipe"
OUTPUT_URL="rtmp://a.rtmp.youtube.com/live2/m1kf-e3ac-s4k8-s6qu-dssp"
FORMAT="flv" # Output format for YouTube
LOG_FILE="$HOME/videos/live_stream.log"

# Create a named pipe for ffmpeg
setup_pipe() {
    if [[ ! -e $PIPE ]]; then
        mkfifo "$PIPE"
    fi
    # Keep pipe open with a background process
    ( while true; do sleep 1; done ) > "$PIPE" &
    PIPE_KEEPER_PID=$!
}

# Get the index of the last played video
get_last_video_index() {
    if [[ -f $STATE_FILE ]]; then
        LAST_VIDEO_INDEX=$(cat "$STATE_FILE" | cut -d':' -f1)
        LAST_PLAYBACK_TIME=$(cat "$STATE_FILE" | cut -d':' -f2)
    else
        LAST_VIDEO_INDEX=0
        LAST_PLAYBACK_TIME=0
    fi
}

# Save the state of the current video
save_state() {
    echo "$CURRENT_VIDEO_INDEX:$CURRENT_PLAYBACK_TIME" > "$STATE_FILE"
}

# Feed videos to the named pipe
feed_videos() {
    get_last_video_index
    CURRENT_VIDEO_INDEX=0
    echo "$(date): Resuming from video index $LAST_VIDEO_INDEX, playback time $LAST_PLAYBACK_TIME seconds..." | tee -a "$LOG_FILE"

    # Keep pipe open with a background process
    ( while true; do sleep 1; done ) > "$PIPE" &
    PIPE_KEEPER_PID=$!

    # Read playlist continuously
    while :; do
        while read -r video; do
            [[ -z "$video" ]] && continue
            if [[ ! -f "$HOME/videos/$video" ]]; then
                echo "$(date): File $HOME/videos/$video does not exist, skipping..." | tee -a "$LOG_FILE"
                continue
            fi

            if [[ $CURRENT_VIDEO_INDEX -lt $LAST_VIDEO_INDEX ]]; then
                CURRENT_VIDEO_INDEX=$((CURRENT_VIDEO_INDEX + 1))
                continue
            fi

            CURRENT_PLAYBACK_TIME=${LAST_PLAYBACK_TIME:-0}
            echo "$(date): Streaming $HOME/videos/${video} from $CURRENT_PLAYBACK_TIME seconds..." | tee -a "$LOG_FILE"

            # Run ffmpeg with error handling and proper pipe management
            local retry_count=0
            while true; do
                echo "$(date): Attempting to stream $video (attempt $((retry_count + 1)))..." | tee -a "$LOG_FILE"
                
                (ffmpeg -nostdin -re -ss "$CURRENT_PLAYBACK_TIME" -i "$HOME/videos/${video}" \
                    -vf "scale=2560:1440,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='zymo.tv':x=10:y=h-50:fontsize=48:fontcolor=white@0.2" \
                    -c:v libx264 -preset slow -crf 20 -maxrate 10000k -bufsize 20000k \
                    -c:a aac -b:a 192k \
                    -vsync 1 \
                    -async 1 \
                    -fflags +genpts \
                    -f mpegts pipe:1 > "$PIPE") 2>> "$LOG_FILE"
                
                exit_code=$?
                if [ $exit_code -eq 0 ]; then
                    echo "$(date): Successfully completed streaming $video" | tee -a "$LOG_FILE"
                    break
                else
                    retry_count=$((retry_count + 1))
                    echo "$(date): FFmpeg failed for $video with exit code $exit_code (attempt $retry_count)" | tee -a "$LOG_FILE"
                    echo "$(date): Last few lines of error log:" | tee -a "$LOG_FILE"
                    tail -n 5 "$LOG_FILE" | tee -a "$LOG_FILE"
                    echo "$(date): Retrying in 2 seconds..." | tee -a "$LOG_FILE"
                    sleep 2
                fi
            done

            CURRENT_PLAYBACK_TIME=0
            LAST_PLAYBACK_TIME=0
            save_state
            CURRENT_VIDEO_INDEX=$((CURRENT_VIDEO_INDEX + 1))
            LAST_VIDEO_INDEX=$CURRENT_VIDEO_INDEX
        done < "$VIDEO_LIST"
        sleep 1  # Brief pause before checking for new entries
    done

    # Cleanup pipe keeper
    kill $PIPE_KEEPER_PID 2>/dev/null
}

# Start streaming to the output URL
start_stream() {
    echo "$(date): Killing any existing ffmpeg processes..." | tee -a "$LOG_FILE"
    pkill -f ffmpeg || true
    sleep 2  # Give processes time to die

    echo "$(date): Starting ffmpeg live stream to $OUTPUT_URL..." | tee -a "$LOG_FILE"
    ffmpeg -nostdin -re -fflags +igndts -i "$PIPE" \
           -c:v copy -c:a copy \
           -vsync 1 -async 1 \
           -f $FORMAT -flvflags no_duration_filesize "$OUTPUT_URL" >> "$LOG_FILE" 2>&1 &
    STREAM_PID=$!
    wait "$STREAM_PID"
}

# Cleanup on exit
cleanup() {
    echo "$(date): Cleaning up..." | tee -a "$LOG_FILE"
    pkill -f ffmpeg || true
    kill $PIPE_KEEPER_PID 2>/dev/null
    [[ -p $PIPE ]] && rm -f "$PIPE"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Main script
if [[ ! -f $VIDEO_LIST ]]; then
    echo "$(date): $VIDEO_LIST not found. Please create the file with the list of videos." | tee -a "$LOG_FILE"
    exit 1
fi

setup_pipe
feed_videos &
start_stream
