#!/bin/bash

# Configuration
VIDEO_LIST="$HOME/videos/playlist.txt"
STATE_FILE="$HOME/videos/rtmp_state.txt"
PIPE="$HOME/videos/video_pipe"
OUTPUT_URL="rtmp://a.rtmp.youtube.com/live2/m1kf-e3ac-s4k8-s6qu-dssp"
FORMAT="flv" # Change to your desired format
LOG_FILE="$HOME/videos/live_stream.log"

# Create a named pipe for ffmpeg
setup_pipe() {
    if [[ ! -p $PIPE ]]; then
        mkfifo "$PIPE"
    fi
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
    echo "$(date): Resuming from video index $LAST_VIDEO_INDEX, playback time $LAST_PLAYBACK_TIME seconds..." | tee -a "$LOG_FILE"

    while :; do
        CURRENT_VIDEO_INDEX=0
        while read -r video; do
            if [[ $CURRENT_VIDEO_INDEX -lt $LAST_VIDEO_INDEX ]]; then
                CURRENT_VIDEO_INDEX=$((CURRENT_VIDEO_INDEX + 1))
                continue
            fi

            CURRENT_PLAYBACK_TIME=${LAST_PLAYBACK_TIME:-0}
            echo "$(date): Streaming $HOME/videos/$video from $CURRENT_PLAYBACK_TIME seconds..." | tee -a "$LOG_FILE"
            ffmpeg -re -ss "$CURRENT_PLAYBACK_TIME" -i "$HOME/videos/$video" \
                   -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='zymo.tv':x=10:y=h-40:fontsize=24:fontcolor=white@0.6,scale=1280:720" \
                   -c:v libx264 -preset fast -c:a aac -b:a 128k -f mpegts pipe:1 > "$PIPE" 2>>"$LOG_FILE"

            # Reset the playback time for subsequent videos
            CURRENT_PLAYBACK_TIME=0
            save_state
            CURRENT_VIDEO_INDEX=$((CURRENT_VIDEO_INDEX + 1))
        done < "$VIDEO_LIST"

        # Loop back to the beginning
        LAST_VIDEO_INDEX=0
        LAST_PLAYBACK_TIME=0
    done
}

# Start streaming to the output URL
start_stream() {
    echo "$(date): Starting ffmpeg live stream..." | tee -a "$LOG_FILE"
    ffmpeg -re -f mpegts -i "$PIPE" \
           -c:v copy -c:a aac -f $FORMAT "$OUTPUT_URL" >> "$LOG_FILE" 2>&1 &
    STREAM_PID=$!
    wait "$STREAM_PID"
}

# Monitor the video list for changes
monitor_changes() {
    echo "$(date): Monitoring $VIDEO_LIST for changes..." | tee -a "$LOG_FILE"
    inotifywait -m "$VIDEO_LIST" -e modify | while read -r _; do
        echo "$(date): $VIDEO_LIST updated, reloading playlist..." | tee -a "$LOG_FILE"
    done
}

# Cleanup on exit
cleanup() {
    echo "$(date): Cleaning up..." | tee -a "$LOG_FILE"
    [[ -p $PIPE ]] && rm -f "$PIPE"
    kill -9 "$STREAM_PID" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main script
if [[ ! -f $VIDEO_LIST ]]; then
    echo "$(date): $VIDEO_LIST not found. Please create the file with the list of videos." | tee -a "$LOG_FILE"
    exit 1
fi

setup_pipe
feed_videos &
monitor_changes &
start_stream
