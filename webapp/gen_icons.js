const fs = require('fs');
const b64 = fs.readFileSync('e:/NVHTTN/landing-page-ky-nang-he/webapp/logo_b64.txt', 'utf8');

const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 508 510">
  <image href="data:image/png;base64,${b64}" width="508" height="510"/>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 508 510">
  <image href="data:image/png;base64,${b64}" width="508" height="510"/>
</svg>`;

fs.writeFileSync('e:/NVHTTN/landing-page-ky-nang-he/webapp/icon-192.svg', svg192);
fs.writeFileSync('e:/NVHTTN/landing-page-ky-nang-he/webapp/icon-512.svg', svg512);
