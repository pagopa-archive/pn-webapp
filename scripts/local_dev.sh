if ( [ "first_time" = "$1" ] ) then
    echo "Install required tools"
    npm install -g envsub 
    npm install -g http-server
    npm install -g local-cors-proxy
fi

PN_DELIVERY_URL=http://localhost:8080/
LPC_PORT=8095
HTTP_SERVER_PORT=8090

export API_GW_BASE_URL=http://localhost:${LPC_PORT}/proxy
mkdir -p dist 
envsub src/index.html dist/index.html
envsub src/receiver.html dist/receiver.html
envsub src/sender.html dist/sender.html
cp -r src/js dist/

echo "Start CORS proxy"
lcp --proxyUrl ${PN_DELIVERY_URL} --port ${LPC_PORT} &
lcp_pid=$!
echo "CORS proxy pid $lcp_pid"

echo "Start CDN server on port ${HTTP_SERVER_PORT}"
http-server -p ${HTTP_SERVER_PORT}

echo "Stop CORS proxy"
kill ${lcp_pid}
