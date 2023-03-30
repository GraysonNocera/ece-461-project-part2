#! /usr/bin/bash
echo "Running Update"

# Update this line to only target the "myApp" process
pkill -f "package-api" && reset
## sleep 1
## cd ~/ece-461-project-part2 && sleep 0.5
## git pull && sleep 0.5
## npm install > ~/npm_install_output.log && sleep 0.5
## npm install ts-node -g > ~/npm_install_output.log && sleep 0.5

# sleep 1
# clear

# Make sure the webhook process is not killed
# ts-node ~/ece-461-project-part2/WebHooks/webhook.ts &
ts-node ~/ece-461-project-part2/src/api/app.ts &
