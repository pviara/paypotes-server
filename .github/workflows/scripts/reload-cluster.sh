check_cluster_running() {
    local app_name="$1"
    pm2 list | grep -w "$app_name" | grep -v grep > /dev/null
    return $?
}

if check_cluster_running "paypot-api"; then
        echo "Already running cluster paypot-api"
        pm2 reload paypot-api
else
        echo "Cluster paypot-api not running yet"
        pm2 start ./.github/workflows/res/ecosystem.yml
fi