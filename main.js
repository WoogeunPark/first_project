const textInput = document.getElementById('text-input');
const generateButton = document.getElementById('generate-button');
const qrcodeContainer = document.getElementById('qrcode');

generateButton.addEventListener('click', () => {
  const text = textInput.value;
  if (text) {
    try {
      const typeNumber = 4;
      const errorCorrectionLevel = 'L';
      const qr = qrcode(typeNumber, errorCorrectionLevel);
      qr.addData(text);
      qr.make();
      qrcodeContainer.innerHTML = qr.createImgTag();
    } catch (e) {
      console.error(e);
      alert("Error generating QR code.");
    }
  }
});