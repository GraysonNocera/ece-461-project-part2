#! /usr/bin/bash
pkill -f "package-api"
cd ~/ece-461-project-part2
git fetch
git pull origin main

sleep 0.5

npm install > ~/npm_install_output.log && sleep 0.5

# Restart App.ts
ts-node ~/ece-461-project-part2/src/api/app.ts &

# Restart Frontend
cd ~/ece-461-project-part2/src/angular_autogen/src/app && ng serve
