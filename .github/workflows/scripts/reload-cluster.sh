#!/bin/bash

export PM2_HOME=/home/pviara/.pm2

check_cluster_running() {
    local app_name="$1"
    pm2 save
    pm2 list | grep -w "$app_name" | grep -v grep > /dev/null
    return $?
}

if check_cluster_running "paypotes-server"; then
        echo "Already running cluster paypotes-server"
        pm2 reload paypotes-server
else
        echo "Cluster paypotes-server not running yet"
        pm2 start ./.github/workflows/res/ecosystem.yml
fi