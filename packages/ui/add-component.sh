#!/bin/bash

# Script to add shadcn/ui components to the packages/ui directory
# Usage: ./add-component.sh button card dialog

if [ $# -eq 0 ]; then
    echo "Usage: $0 <component-name> [component-name...]"
    echo "Example: $0 button card dialog"
    exit 1
fi

# Change to the packages/ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Add each component
for component in "$@"; do
    echo "Adding component: $component"
    pnpm dlx shadcn@latest add "$component" --yes
done

echo "Components added successfully!"