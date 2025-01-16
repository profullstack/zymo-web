#!/bin/bash

# Replace /static/ references with / in all relevant files
find . \( -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.svelte" -o -name "*.ts" \) -not -path "./node_modules/*" -not -path "./stores/*" -not -path "./build/*" -exec sed -i 's|/static/|/|g' {} +

echo "Replaced all /static/ references with / in HTML, JS, CSS, Svelte, and TypeScript files (excluding node_modules, stores, and build directories)"