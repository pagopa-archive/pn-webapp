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
    let paId = "pa_id";
    let apiKey = "apiKey";

    let buf = fs.readFileSync("src/TSY-Scheda RiepilogoDUB-01-1.0.pdf");
    let sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    let base64 = buf.toString('base64');

    let recipientsCount = argv.recipient.taxId.length;
    let documentsCount = argv.documents.digests.sha256.length;

    if (recipientsCount > 5 || documentsCount > 5) {
        console.log("Sono ammessi non piu di 5 recipients o allegati");
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

    for (let j = 0; j < documentsCount; j++) {
        requestBody.documents.push({
            body: base64,
            contentType: documents.contentType[j],
            digests : {
                sha256: sha256
            }
        });
    }

    const data = JSON.stringify( requestBody );
    const options = {
        hostname: 'localhost',
        port: 8080,
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
