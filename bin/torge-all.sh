#for i in tpb lt nyaa 1337x rarbg
for i in   thepiratebay limetorrents 1337x rarbg nyaa libgen
do
    torge "$i" --no-prompt --link-conv -s date --json "$@"
done | jq -rcs '. | map(select(.site != null and .results != null) | {"provider":(.site // "unknown"),"results":.results})'
