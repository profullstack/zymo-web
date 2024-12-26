#!/usr/bin/env bash
find . -name "*.js" -type f -exec sed -Ei "
    s#import \{ (view|error|redirect|ws|sse) \} from ['\"]primate['\"']#import \1 from 'primate/handler/\1'#g;
    s#import \{ (view|redirect) \} from ['\"]primate['\"']#import view from 'primate/handler/view'\nimport redirect from 'primate/handler/redirect'#g
" {} +
