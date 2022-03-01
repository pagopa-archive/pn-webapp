if ( [ "first_time" = "$1" ] ) then
    echo "Install required tools"
    npm install -g envsub 
    npm install -g http-server
fi

is_win=$( echo $OS | grep "Win" | wc -l )

HTTP_SERVER_PORT=8090

#export API_GW_BASE_URL=https://api.dev.pn.pagopa.it
export API_GW_BASE_URL=http://localhost:8080

echo "Build"
mkdir -p dist
envsub src/index.html dist/index.html
envsub src/notification_details.html dist/notification_details.html
envsub src/sender.html dist/sender.html
envsub src/sender_search.html dist/sender_search.html
envsub src/receiver_search.html dist/receiver_search.html
envsub src/direct_access.html dist/direct_access.html
envsub src/failed_paper_notification.html dist/failed_paper_notification.html
cp -r src/js dist/
cp -r src/media dist/


echo "Start CDN server on port ${HTTP_SERVER_PORT}"
http-server -p ${HTTP_SERVER_PORT}

if ( [ "$is_win" -ne 1 ] ) then
	echo "Stop CORS proxy"
	kill ${lcp_pid}
fi
