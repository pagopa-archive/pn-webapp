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

    let buf = fs.readFileSync("src/tmp/temp.pdf");
    let sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    let base64 = buf.toString('base64');

    let recipientIsArray = Array.isArray(argv.recipient.taxId);
    let documentIsArray = Array.isArray(argv.documents.digests.sha256);

    if (recipientIsArray && recipientIsArray.length > 5) {
        console.log("Sono ammessi non piu' di 5 Destinatari");
        process.exit(1);
    }

    if (documentIsArray && documentIsArray.length > 5) {
        console.log("Sono ammessi non piu' di 5 Allegati");
        process.exit(1);
    }

    let recipient = argv.recipient;
    let documents = argv.documents;

    let requestBody = {
        paNotificationId: argv.paNotificationId,
        subject: argv.subject,
        cancelledIun: "string",
        recipients: [],
        documents: []
    };

    if (recipientIsArray) {
        let recipientsCount = argv.recipient.taxId.length;
        for (let i = 0; i < recipientsCount; i++) {
            requestBody.recipients.push({
                taxId: recipient.taxId[i],
                denomination: recipient.denomination[i],
                digitalDomicile: {
                    type: recipient.digitalDomicile.type[i] ,
                    address: recipient.digitalDomicile.address[i] 
                },
                physicalAddress: {
                    at: recipient.physicalAddress.at[i],
                    address: recipient.physicalAddress.address[i],
                    addressDetails: recipient.physicalAddress.addressDetails[i],
                    zip: recipient.physicalAddress.zip[i],
                    municipality: recipient.physicalAddress.municipality[i],
                    province: recipient.physicalAddress.province[i]
                }
            })
        }
    } else {
        requestBody.recipients.push({
            taxId: recipient.taxId,
            denomination: recipient.denomination,
            digitalDomicile: {
                type: recipient.digitalDomicile.type,
                address: recipient.digitalDomicile.address 
            },
            physicalAddress: {
                at: recipient.physicalAddress.at,
                address: recipient.physicalAddress.address,
                addressDetails: recipient.physicalAddress.addressDetails,
                zip: recipient.physicalAddress.zip,
                municipality: recipient.physicalAddress.municipality,
                province: recipient.physicalAddress.province
            }
        });
    }    

    if (documentIsArray) {
        let documentsCount = argv.documents.digests.sha256.length;
        for (let j = 0; j < documentsCount; j++) {
            requestBody.documents.push({
                body: base64,
                contentType: documents.contentType[j],
                digests : {
                    sha256: sha256
                }
            });
        }
    } else {
        requestBody.documents.push({
            body: base64,
            contentType: documents.contentType,
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
