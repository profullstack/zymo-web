#!/bin/bash

# Configuration
VIDEO_LIST="$HOME/videos/playlist.txt"
PIPE="$HOME/videos/video_pipe"
OUTPUT_URL="rtmp://a.rtmp.youtube.com/live2/m1kf-e3ac-s4k8-s6qu-dssp"
FORMAT="flv"
LOG_FILE="$HOME/videos/live_stream.log"
FFMPEG_INPUT_PID_FILE="$HOME/videos/ffmpeg_input.pid"
FFMPEG_OUTPUT_PID_FILE="$HOME/videos/ffmpeg_output.pid"

# Create a named pipe for ffmpeg
setup_pipe() {
    if [[ ! -e $PIPE ]]; then
        mkfifo "$PIPE"
    fi
    ( while true; do sleep 1; done ) > "$PIPE" &
    PIPE_KEEPER_PID=$!
    echo $PIPE_KEEPER_PID > "$HOME/videos/pipe_keeper.pid"
}

# Feed videos to the named pipe
feed_videos() {
    # Read playlist continuously
    while :; do
        while read -r video; do
            [[ -z "$video" ]] && continue
            if [[ ! -f "$HOME/videos/$video" ]]; then
                echo "$(date): File $HOME/videos/$video does not exist, skipping..." | tee -a "$LOG_FILE"
                continue
            fi

            # Kill any existing input ffmpeg process
            if [[ -f "$FFMPEG_INPUT_PID_FILE" ]]; then
                kill $(cat "$FFMPEG_INPUT_PID_FILE") 2>/dev/null || true
                rm -f "$FFMPEG_INPUT_PID_FILE"
            fi

            local retry_count=0
            while true; do
                echo "$(date): Attempting to stream $video (attempt $((retry_count + 1)))..." | tee -a "$LOG_FILE"
                
                (ffmpeg -nostdin -re -i "$HOME/videos/${video}" \
                    -vf "scale=2560:1440,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='zymo.tv':x=10:y=h-50:fontsize=48:fontcolor=white@0.2" \
                    -c:v libx264 -preset slow -crf 20 -maxrate 10000k -bufsize 20000k \
                    -c:a aac -b:a 192k -ar 48000 \
                    -af "aresample=async=1000" \
                    -vsync 1 \
                    -async 1 \
                    -fflags +genpts \
                    -f mpegts pipe:1 > "$PIPE") 2>> "$LOG_FILE" & 
                FFMPEG_INPUT_PID=$!
                echo $FFMPEG_INPUT_PID > "$FFMPEG_INPUT_PID_FILE"
                
                wait $FFMPEG_INPUT_PID
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
        done < "$VIDEO_LIST"
        sleep 1
    done
}

start_stream() {
    echo "$(date): Killing any existing ffmpeg processes..." | tee -a "$LOG_FILE"
    if [[ -f "$FFMPEG_OUTPUT_PID_FILE" ]]; then
        kill $(cat "$FFMPEG_OUTPUT_PID_FILE") 2>/dev/null || true
        rm -f "$FFMPEG_OUTPUT_PID_FILE"
    fi
    sleep 2

    echo "$(date): Starting ffmpeg live stream to $OUTPUT_URL..." | tee -a "$LOG_FILE"
    ffmpeg -nostdin -re -fflags +igndts -i "$PIPE" \
           -c:v copy -c:a copy \
           -vsync 1 -async 1 \
           -f $FORMAT -flvflags no_duration_filesize "$OUTPUT_URL" >> "$LOG_FILE" 2>&1 &
    STREAM_PID=$!
    echo $STREAM_PID > "$FFMPEG_OUTPUT_PID_FILE"
    wait "$STREAM_PID"
}

cleanup() {
    echo "$(date): Cleaning up..." | tee -a "$LOG_FILE"
    
    if [[ -f "$FFMPEG_INPUT_PID_FILE" ]]; then
        kill $(cat "$FFMPEG_INPUT_PID_FILE") 2>/dev/null || true
        rm -f "$FFMPEG_INPUT_PID_FILE"
    fi
    
    if [[ -f "$FFMPEG_OUTPUT_PID_FILE" ]]; then
        kill $(cat "$FFMPEG_OUTPUT_PID_FILE") 2>/dev/null || true
        rm -f "$FFMPEG_OUTPUT_PID_FILE"
    fi
    
    if [[ -f "$HOME/videos/pipe_keeper.pid" ]]; then
        kill $(cat "$HOME/videos/pipe_keeper.pid") 2>/dev/null || true
        rm -f "$HOME/videos/pipe_keeper.pid"
    fi
    
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
