url_prefix="http://localhost:8080"
api_key="api-key"

if ( [ -f 'package.json' ] ) then
  npm install
  node src/cli_send.js --hostname=$hostname --port=$port --url_prefix=$url_prefix \
      --baseUrl="${url_prefix}" \
      --paId="fromCli" \
      --api-key="${api_key}" \
      \
      --paNotificationId="protocollo123" \
      --subject="Una multa o simile" \
	  --physicalCommunicationType="REGISTERED_LETTER_890" \
      \
      --recipient.taxId="CGNNMO80A01H501M"  \
      --recipient.denomination="Nome1 Cognome1"  \
      --recipient.digitalDomicile.type="PEC" \
      --recipient.digitalDomicile.address="nome1.cognome1@fail-both.domicilio-digitale.it" \
      --recipient.physicalAddress.address="ImmediateResponse: In via che non esiste numero 1" \
      --recipient.physicalAddress.at="Presso qualcuno" \
      --recipient.physicalAddress.addressDetails="Scala A" \
      --recipient.physicalAddress.zip="11111" \
      --recipient.physicalAddress.municipality="Comune 1" \
      --recipient.physicalAddress.province="PROVINCIA1" \
      \
      --recipient.taxId="CGNNMO80A02H501R"  \
      --recipient.denomination="Nome2 Cognome2"  \
      --recipient.digitalDomicile.type="PEC" \
      --recipient.digitalDomicile.address="nome2.cognome2@fail-first.domicilio-digitale.it" \
      --recipient.physicalAddress.address="ImmediateResponse: In via che non esiste numero 2" \
      --recipient.physicalAddress.at="Presso qualcuno" \
      --recipient.physicalAddress.addressDetails="Scala B" \
      --recipient.physicalAddress.zip="22222" \
      --recipient.physicalAddress.municipality="Comune 2" \
      --recipient.physicalAddress.province="PROVINCIA2" \
      \
      --document.contentType="application/pdf" \
      --document.file="cli_send_example/lettera_accompagnamento.pdf" \
      \
      --document.contentType="application/pdf" \
      --document.file="cli_send_example/multa.pdf"
else
  echo "Questo script va eseguito nella radice del progetto."
fi


