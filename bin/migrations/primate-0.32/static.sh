#!/bin/bash

# Replace /static/ references with / in all relevant files
find . \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.svelte" -o -name "*.ts" \) -not -path "./node_modules/*" -exec sed -i 's|/static/|/|g' {} +

echo "Replaced all /static/ references with / in HTML, JS, CSS, Svelte, and TypeScript files"