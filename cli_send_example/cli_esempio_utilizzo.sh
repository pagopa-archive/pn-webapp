hostname=localhost
port=8080
url_prefix="/"


if ( [ -f 'package.json' ] ) then
  npm install
  node src/cli.js --hostname=$hostname --port=$port --url_prefix=$url_prefix \
      --baseUrl="http://localhost:8080" \
      --paId="paId" \
      --api-key="api-key" \
      \
      --paNotificationId="protocollo123" \
      --subject="Una multa o simile" \
      \
      --recipient.taxId="CGNNMO80A01H501M"  \
      --recipient.denomination="Nome1 Cognome1"  \
      --recipient.digitalDomicile.type="PEC" \
      --recipient.digitalDomicile.address="nome1.cognome1@fail-both.domicilio-digitale.it" \
      --recipient.physicalAddress.address="In via che non esiste numero 1" \
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
      --recipient.physicalAddress.address="In via che non esiste numero 2" \
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


