const fetch = require('node-fetch');

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { timeStamp } = require('console');
const { exit } = require('process');
const argv = yargs(hideBin(process.argv)).argv

async function main() {
    let params = normalizeParameters( argv );

    console.log("##########################");
    console.log("###     PRELOADING     ###");
    console.log("##########################");
    for( let doc of params.documents ) {
        let preloadedDoc = await preloadDocument( params, doc );
        console.log( "=> Preloaded ", doc, preloadedDoc );
        doc.preload = preloadedDoc;
    }
    console.log("\n\n\n\n\n");

    console.log("##########################");
    console.log("### SEND NOTIFICATION ###");
    console.log("##########################");
    let info = await sendNotification( params );

    console.log("\n\n");
    console.log( info )
}




preloadKey = 0;

async function preloadDocument( params, doc) {
    let reserveUrl = params.baseUrl + '/delivery/attachments/preload';
    let fileKey = "doc_"+( preloadKey++ );
    let body = JSON.stringify( { key: fileKey })

    console.log("POST to ", reserveUrl, " with ", body );
    let preloadInfoResponse = await fetch( reserveUrl, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'x-api-key': params.apiKey,
            'X-PagoPA-PN-PA': params.paId,
            'Content-Type': 'application/json'
        },
        body: body
    });

    let preloadInfo = await preloadInfoResponse.json();
    console.log( "RESULT:", preloadInfo );


    let fileBody = fs.readFileSync( doc.path );
    let loadUrl = preloadInfo.url
    console.log("send to ", loadUrl );
    let loadResponse = await fetch( loadUrl, {
        method: preloadInfo.httpMethod,
        cache: 'no-cache',
        headers: {
            'Content-Type': doc.contentType,
            'x-amz-meta-secret': preloadInfo.secret
        },
        body: fileBody
    });
    let versionId = loadResponse.headers.get('x-amz-version-id');
    console.log("VersionId:", versionId );

    return { key: preloadInfo.key, versionId: versionId }
}

async function sendNotification( params ) {
    let hostname = argv.hostname || 'localhost';
    let port = argv.port || '8080';
    let paId = argv.paId;
    let apiKey = argv.apiKey;

    let recipientArg = argv.recipient;
    let documentArg = argv.document;
    let recipientIsArray = Array.isArray(recipientArg.taxId);
    let documentIsArray = Array.isArray(documentArg.file);

    let requestBody = {
        paNotificationId: params.paNotificationId,
        subject: params.subject,
        cancelledIun: null,
        recipients: params.recipients,
        documents: []
    };

    for( let doc of params.documents ) {
        let buf = fs.readFileSync( doc.path );
        let sha256 = crypto.createHash('sha256').update(buf).digest('hex');

        console.log( doc.path, "sha256", sha256 );
        requestBody.documents.push({
                digests: {
                    sha256: sha256
                },
                ref: {
                    key: doc.preload.key,
                    versionToken: doc.preload.versionId
                }
            });
    }

    let postUrl = params.baseUrl + '/delivery/notifications/sent';
    console.log("POST to ", postUrl, " with ", requestBody );
    let notificationResponse = await fetch( postUrl, {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'x-api-key': params.apiKey,
                'X-PagoPA-PN-PA': params.paId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( requestBody )
        });
    return await notificationResponse.json();
}


function normalizeParameters( argv ) {
    let baseUrl = argv.baseUrl || 'http://localhost:8080'
    let apiKey = argv.apiKey;

    let paId = argv.paId;
    let paNotificationId = argv.paNotificationId;
    let subject = argv.subject;

    let recipientArg = argv.recipient;
    let recipients = [];
    if( Array.isArray(recipientArg.taxId) ) {
        let recipientsCount = recipientArg.taxId.length;
        for (let i = 0; i < recipientsCount; i++) {
            recipients.push({
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
    }
    else {
        recipients.push( {
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
        })
    }

    let documentArg = argv.document;
    let documents = [];
    if( Array.isArray(documentArg.file) ) {
        let documentsCount = documentArg.file.length;
        for (let j = 0; j < documentsCount; j++) {
            documents.push({
                    path: documentArg.file[j],
                    contentType: documentArg.contentType[j]
                });
        }
    }
    else {
        documents.push({
                path: documentArg.file,
                contentType: documentArg.contentType
            });
    }

    return { baseUrl, apiKey, paId, paNotificationId, subject, recipients, documents }
}


main();
