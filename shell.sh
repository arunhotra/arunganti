#!/bin/bash

# Open interactive shell in test container
# Usage: ./shell.sh

echo "Building test container..."
podman-compose build

echo "Opening shell in container..."
podman-compose run --rm test /bin/bash
