#!/bin/bash

# Run tests in Podman container
# Usage: ./test.sh [jest-options]

echo "Building test container..."
podman-compose build

echo "Running tests..."
podman-compose run --rm test npm test "$@"
