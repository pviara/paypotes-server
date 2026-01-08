check_cluster_running() {
    local app_name="$1"
    pm2 save
    pm2 list | grep -w "$app_name" | grep -v grep > /dev/null
    return $?
}

if check_cluster_running "paypotes-api"; then
        echo "Already running cluster paypotes-api"
        pm2 reload paypotes-api
else
        echo "Cluster paypotes-api not running yet"
        pm2 start ./.github/workflows/res/ecosystem.yml
fi