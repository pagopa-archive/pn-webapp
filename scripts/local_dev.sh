if ( [ "first_time" = "$1" ] ) then
    echo "Install required tools"
    npm install -g envsub 
    npm install -g http-server
    npm install -g local-cors-proxy
fi

is_win=$( echo $OS | grep "Win" | wc -l )

PN_DELIVERY_URL=http://localhost:8080/
LPC_PORT=8095
HTTP_SERVER_PORT=8090

export API_GW_BASE_URL=http://localhost:${LPC_PORT}/proxy
mkdir -p dist 
envsub src/index.html dist/index.html
envsub src/receiver.html dist/receiver.html
envsub src/sender.html dist/sender.html
envsub src/search.html dist/search.html
cp -r src/js dist/

echo "Start CORS proxy"
lcp --proxyUrl ${PN_DELIVERY_URL} --port ${LPC_PORT} &
lcp_pid=$!
echo "CORS proxy pid $lcp_pid"

echo "Start CDN server on port ${HTTP_SERVER_PORT}"
http-server -p ${HTTP_SERVER_PORT}

if ( [ "$is_win" -ne 1 ] ) then
	echo "Stop CORS proxy"
	kill ${lcp_pid}
fi
