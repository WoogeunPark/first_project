document.addEventListener('DOMContentLoaded', () => {
      // Language Selection
      const languageSelect = document.getElementById('language-select');

      // QR Code Type Selection
      const qrTypeSelect = document.getElementById('qr-type');
      const textForm = document.getElementById('text-form');
      const wifiForm = document.getElementById('wifi-form');
      const emailForm = document.getElementById('email-form');
      const smsForm = document.getElementById('sms-form');
      const vcardForm = document.getElementById('vcard-form');

      // Input Fields
      const textInput = document.getElementById('text-input');
      const wifiSsidInput = document.getElementById('wifi-ssid');
      const wifiPasswordInput = document.getElementById('wifi-password');
      const wifiEncryptionSelect = document.getElementById('wifi-encryption');
      const emailToInput = document.getElementById('email-to');
      const emailSubjectInput = document.getElementById('email-subject');
      const emailBodyInput = document.getElementById('email-body');
      const smsToInput = document.getElementById('sms-to');
      const smsBodyInput = document.getElementById('sms-body');
      const vcardNameInput = document.getElementById('vcard-name');
      const vcardPhoneInput = document.getElementById('vcard-phone');
      const vcardEmailInput = document.getElementById('vcard-email');
      const fgColorInput = document.getElementById('fg-color');
      const bgColorInput = document.getElementById('bg-color');

      // Buttons and Containers
      const generateButton = document.getElementById('generate-button');
      const qrcodeContainer = document.getElementById('qrcode');
      const downloadButtons = document.getElementById('download-buttons');
      const downloadPngButton = document.getElementById('download-png');
      const downloadJpegButton = document.getElementById('download-jpeg');
      const downloadPdfButton = document.getElementById('download-pdf');

      // --- Internationalization (i18n) ---
      const setLanguage = (lang) => {
        const t = translations[lang];
        if (!t) {
          console.error("Translations for language " + lang + " not found.");
          return;
        }

        // Translate document title
        document.title = t["pageTitle"];

        // Translate elements with data-i18n-key
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
          const key = element.getAttribute('data-i18n-key');
          if (t[key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
              element.setAttribute('placeholder', t[key]);
            } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('placeholder')) {
              element.setAttribute('placeholder', t[key]);
            } else if (element.tagName === 'OPTION') {
                element.textContent = t[key];
            } 
            } else if (element.querySelector('i.fas')) { // Check if element contains a Font Awesome icon
                const iconHtml = element.querySelector('i.fas').outerHTML;
                element.innerHTML = iconHtml + ' ' + t[key]; // Re-add icon and new text
            } else {
              element.textContent = t[key]; // Use textContent for plain text elements
          }
        });
        
        // Specific handling for strong tags within descriptions
        document.querySelectorAll('.description-card p strong').forEach(strongElement => {
          const key = strongElement.getAttribute('data-i18n-key');
          if (t[key]) {
            strongElement.textContent = t[key];
          }
        });
      };

      // Load saved language or default to English
      const savedLang = localStorage.getItem('language') || 'en';
      languageSelect.value = savedLang;
      setLanguage(savedLang);

      // Language switcher event listener
      languageSelect.addEventListener('change', (event) => {
        const newLang = event.target.value;
        localStorage.setItem('language', newLang);
        setLanguage(newLang);
      });


      // --- QR Code Generation ---

      const createQrCode = (data, fgColor, bgColor) => {
        const typeNumber = 0; // Auto-detect
        const errorCorrectionLevel = 'H';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(data);
        qr.make();

        const canvas = document.createElement('canvas');
        const size = qr.getModuleCount();
        const cellSize = 8;
        canvas.width = size * cellSize;
        canvas.height = size * cellSize;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = fgColor;
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
          }
        }
        return canvas;
      };


      // --- Event Listeners ---

      // Switch forms based on QR code type selection
      qrTypeSelect.addEventListener('change', () => {
        textForm.style.display = 'none';
        wifiForm.style.display = 'none';
        emailForm.style.display = 'none';
        smsForm.style.display = 'none';
        vcardForm.style.display = 'none';

        if (qrTypeSelect.value === 'text') {
          textForm.style.display = 'block';
        } else if (qrTypeSelect.value === 'wifi') {
          wifiForm.style.display = 'block';
        } else if (qrTypeSelect.value === 'email') {
          emailForm.style.display = 'block';
        } else if (qrTypeSelect.value === 'sms') {
          smsForm.style.display = 'block';
        } else if (qrTypeSelect.value === 'vcard') {
          vcardForm.style.display = 'block';
        }
      });

      // Map description card titles to QR type values
      const typeMap = {
        'descTextTitle': 'text',
        'descWifiTitle': 'wifi',
        'descEmailTitle': 'email',
        'descSmsTitle': 'sms',
        'descVcardTitle': 'vcard'
      };

      // Add event listeners to description cards
      document.querySelectorAll('.description-card').forEach(card => {
        card.style.cursor = 'pointer'; // Indicate interactivity
        card.addEventListener('click', () => {
          const h3Key = card.querySelector('h3').getAttribute('data-i18n-key');
          const qrType = typeMap[h3Key];
          if (qrType) {
            qrTypeSelect.value = qrType;
            // Manually dispatch change event to update the form
            qrTypeSelect.dispatchEvent(new Event('change'));
            // Scroll to the top of the generator form
            document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
      // Generate QR Code on button click
      generateButton.addEventListener('click', () => {
        let qrData = '';
        const selectedType = qrTypeSelect.value;

        if (selectedType === 'text') {
          qrData = textInput.value;
        } else if (selectedType === 'wifi') {
          const ssid = wifiSsidInput.value;
          const password = wifiPasswordInput.value;
          const encryption = wifiEncryptionSelect.value;
          if (ssid) {
            qrData = `WIFI:T:${encryption};S:${ssid};P:${password};;`;
          }
        } else if (selectedType === 'email') {
          const to = emailToInput.value;
          const subject = emailSubjectInput.value;
          const body = emailBodyInput.value;
          if (to) {
            qrData = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          }
        } else if (selectedType === 'sms') {
          const to = smsToInput.value;
          const body = smsBodyInput.value;
          if (to) {
            qrData = `smsto:${to}:${body}`;
          }
        } else if (selectedType === 'vcard') {
          const name = vcardNameInput.value;
          const phone = vcardPhoneInput.value;
          const email = vcardEmailInput.value;
          if (name) {
            qrData = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
          }
        }

        if (qrData) {
          try {
            qrcodeContainer.innerHTML = '';
            qrcodeContainer.classList.remove('generated');

            const fgColor = fgColorInput.value;
            const bgColor = bgColorInput.value;
            const canvas = createQrCode(qrData, fgColor, bgColor);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.imageRendering = 'pixelated'; // For sharp pixels

            qrcodeContainer.appendChild(canvas);
            qrcodeContainer.classList.add('generated');
            downloadButtons.style.display = 'flex';
          } catch (e) {
            console.error(e);
            alert("Error generating QR code. The data might be too long.");
            downloadButtons.style.display = 'none';
            qrcodeContainer.classList.remove('generated');
          }
        } else {
          qrcodeContainer.innerHTML = '';
          downloadButtons.style.display = 'none';
          qrcodeContainer.classList.remove('generated');
          alert("Please fill in the required fields.");
        }
      });

      // --- Download Functions ---

      const downloadImage = (format) => {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) return;

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/' + format);
        a.download = 'qrcode.' + format;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      downloadPngButton.addEventListener('click', () => downloadImage('png'));
      downloadJpegButton.addEventListener('click', () => downloadImage('jpeg'));

      downloadPdfButton.addEventListener('click', () => {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 10;
        const qrSize = 50;
        const imgData = canvas.toDataURL('image/png');

        doc.addImage(imgData, 'PNG', margin, margin, qrSize, qrSize);
        doc.save('qrcode.pdf');
      });
    });