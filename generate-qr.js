const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://play.google.com/store/apps/details?id=com.muminpusulasi.app';
const svgPath = path.join(__dirname, 'images', 'qr_playstore.svg');
const pngPath = path.join(__dirname, 'images', 'qr_playstore.png');

async function generate() {
  // Generate SVG
  const svgString = await QRCode.toString(targetUrl, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: {
      dark: '#071912',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });
  fs.writeFileSync(svgPath, svgString, 'utf8');
  console.log('SVG QR created at:', svgPath);

  // Generate PNG
  await QRCode.toFile(pngPath, targetUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#071912',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });
  console.log('PNG QR created at:', pngPath);
}

generate().catch(err => console.error(err));
