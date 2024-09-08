for i in tpb lt nyaa 1337x rarbg
do
    torge "$i" --no-prompt --link-conv -s date --json "$@"
done | jq -rcs '. | map({"provider":.site,"results":.results})'
