const crypto = require('crypto');
const fs = require('fs');
const http = require('http');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { timeStamp } = require('console');
const { exit } = require('process');
const argv = yargs(hideBin(process.argv)).argv

sendNotification();

function sendNotification() {
    let hostname = "localhost";
    let port = "8080";

    let paId = argv.paId == undefined ? "pa_id" : argv.paId;
    let apiKey = argv.apiKey == undefined ? "apiKey" : argv.apiKey;

    let recipientIsArray = Array.isArray(argv.recipient.taxId);
    let documentIsArray = Array.isArray(argv.document.name);

    if (recipientIsArray && recipientIsArray.length > 5) {
        console.log("Sono ammessi non piu' di 5 Destinatari");
        process.exit(1);
    }

    if (documentIsArray && documentIsArray.length > 5) {
        console.log("Sono ammessi non piu' di 5 Allegati");
        process.exit(1);
    }

    let recipientArg = argv.recipient;
    let documentArg = argv.document;
    
    let requestBody = {
        paNotificationId: argv.paNotificationId,
        subject: argv.subject,
        cancelledIun: "string",
        recipients: [],
        documents: []
    };

    if (recipientIsArray) {
        let recipientsCount = recipientArg.taxId.length;
        for (let i = 0; i < recipientsCount; i++) {
            requestBody.recipients.push({
                taxId: recipientArg.taxId[i],
                denomination: recipientArg.denomination[i],
                digitalDomicile: {
                    type: recipientArg.digitalDomicile.type[i] ,
                    address: recipientArg.digitalDomicile.address[i] 
                },
                physicalAddress: {
                    at: recipientArg.physicalAddress.at[i],
                    address: recipientArg.physicalAddress.address[i],
                    addressDetails: recipientArg.physicalAddress.addressDetails[i],
                    zip: recipientArg.physicalAddress.zip[i],
                    municipality: recipientArg.physicalAddress.municipality[i],
                    province: recipientArg.physicalAddress.province[i]
                }
            })
        }
    } else {
        requestBody.recipients.push({
            taxId: recipientArg.taxId,
            denomination: recipientArg.denomination,
            digitalDomicile: {
                type: recipientArg.digitalDomicile.type,
                address: recipientArg.digitalDomicile.address 
            },
            physicalAddress: {
                at: recipientArg.physicalAddress.at,
                address: recipientArg.physicalAddress.address,
                addressDetails: recipientArg.physicalAddress.addressDetails,
                zip: recipientArg.physicalAddress.zip,
                municipality: recipientArg.physicalAddress.municipality,
                province: recipientArg.physicalAddress.province
            }
        });
    }    

    if (documentIsArray) {
        let documentsCount = documentArg.name.length;
        for (let j = 0; j < documentsCount; j++) {
            let buf = fs.readFileSync(documentArg.name[j]);
            let sha256 = crypto.createHash('sha256').update(buf).digest('hex');
            let base64 = buf.toString('base64');

            requestBody.documents.push({
                body: base64,
                contentType: documentArg.contentType[j],
                digests : {
                    sha256: sha256
                }
            });
        }
    } else {
        let buf = fs.readFileSync(documentArg.name);
        let sha256 = crypto.createHash('sha256').update(buf).digest('hex');
        let base64 = buf.toString('base64');

        requestBody.documents.push({
            body: base64,
            contentType: documentArg.contentType,
            digests: {
                sha256: sha256
            }
        });
    }

    const data = JSON.stringify( requestBody );
    
    const options = {
        hostname: hostname,
        port: port,
        path: '/delivery/notifications/sent',
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'X-PagoPA-PN-PA': paId,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        res.on('data', d => {
            process.stdout.write(d)
        })
    }).on("error", (err) => {
        console.log("Error: ", err.message);
    });

    req.write(data);
    req.end();
}
