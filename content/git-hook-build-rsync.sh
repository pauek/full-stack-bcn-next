#!/bin/bash
set -e
echo "Building and Rsyncing content.full-stack-bcn.dev"
cd $HOME/Postgrau/full-stack-bcn.dev/content/server
$HOME/.volta/bin/npm run build
cd ..
rsync -avz --delete ./ droplet:fullstack-content-deploy-dir/

