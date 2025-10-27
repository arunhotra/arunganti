#!/bin/bash

# Run tests in watch mode (auto-rerun on file changes)
# Usage: ./test-watch.sh

echo "Building test container..."
podman-compose build

echo "Running tests in watch mode..."
echo "Press 'q' to quit, or see Jest commands in the terminal"
podman-compose run --rm test npm run test:watch
