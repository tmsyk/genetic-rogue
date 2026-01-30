#!/bin/bash

# Default commit message if none provided
MSG="${1:-Update}"

echo "Adding all files..."
git add .
echo "Committing with message: $MSG"
git commit -m "$MSG"
echo "Pushing to remote..."
git push

echo "Done!"
