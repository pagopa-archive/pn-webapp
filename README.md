# pn-webapp
Questo pacchetto contiene le risorse statiche di Piattaforma Notifiche.
Di seguito le istruzioni per la compilazione e il deploy di queste tenendo presente che come prerequisito è necessario avere installato sul proprio client i seguenti pacchetti:
	- npm 
	- node.js versione 14

## Comandi avvio
Per avviare l'ambiente è necessario eseguire lo script `local_dev.sh` da una bash.
Solamente la prima volta che lo si esegue va eseguito con il parametro aggiuntivo `first_time` tramite il seguente comando:
	- source scripts/local_dev.sh first_time
mentre da tutte le volte successive va eseguito senza parametro tramite il seguente comando:
	- source scripts/local_dev.sh

Se l'avvio va a buon si riceverà un output come quello che segue e le risorse del pacchetto saranno fruibili da browser alla url http://localhost:8090/dist/:
```
	Start CORS proxy
	CORS proxy pid 6425
	Start CDN server on port 8090
	Starting up http-server, serving ./
	
	http-server settings:
	CORS: disabled
	Cache: 3600 seconds
	Connection Timeout: 120 seconds
	Directory Listings: visible
	AutoIndex: visible
	Serve GZIP Files: false
	Serve Brotli Files: false
	Default File Extension: none
	
	Available on:
	http://172.22.80.1:8090
	http://192.168.16.1:8090
	http://192.168.1.29:8090
	http://127.0.0.1:8090
	Hit CTRL-C to stop the server
	
	Proxy Active
	
	Proxy Url: http://localhost:8080
	Proxy Partial: proxy
	PORT: 8095
	Credentials: false
	Origin: *
	
	To start using the proxy simply replace the proxied part of your url with: http://localhost:8095/proxy
```
## Comandi di stop
Per lo stop dell'ambiente si deve eseguire sulla bash la combinazione di tasto `crtl + c` e si riceverà un output come quello che segue:
```
	[2021-09-17T14:49:16.934Z]  "GET /dist/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
	http-server stopped.
```

Solo per utenti con sistemi operativi della famiglia Windows si segnala che al comando di stop si potrebbe ricevere un output di errore simile a quello che segue:
```
	To start using the proxy simply replace the proxied part of your url with: http://localhost:8095/proxy
	events.js:292
		throw er; // Unhandled 'error' event
		^
	Error: listen EADDRINUSE: address already in use :::8095
		at Server.setupListenHandle [as _listen2] (net.js:1313:16)
```

L'errore è causato dal tentativo non andato a buon fine di kill del processo node, se fosse necessario procedere al kill forzatamente di questo processo si può procedere 
con la seguente modalità:
- avviare con i privilegi di amministratore una PowerShell
- eseguire il comando `Get-Process -Id (Get-NetTCPConnection -LocalPort 8095).OwningProcess` che produrrà un output come quello che segue:
```
	PS C:\WINDOWS\system32> Get-Process -Id (Get-NetTCPConnection -LocalPort 8095).OwningProcess
	Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
	-------  ------    -----      -----     ------     --  -- -----------
		231      52    24188      34308       1,39  22940   1 node
```
- identificare l' Id del processo node e procedere al kill con il comando `Stop-Process -Id 22940`
