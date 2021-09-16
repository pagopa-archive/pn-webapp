export API_GW_BASE_URL=http://localhost:8080
mkdir -p dist 
npm install -g envsub 
envsub src/index.html dist/index.html
envsub src/receiver.html dist/receiver.html
envsub src/sender.html dist/sender.html
cp -r src/js dist/
