function showMessageStatus(message, isSuccess) {
  let statusDiv = document.getElementById('contactus-message-send');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'contactus-message-send';
    statusDiv.style.position = 'fixed';
    statusDiv.style.top = '20px';
    statusDiv.style.left = '50%';
    statusDiv.style.transform = 'translateX(-50%)';
    statusDiv.style.padding = '16px 32px';
    statusDiv.style.borderRadius = '8px';
    statusDiv.style.fontSize = '18px';
    statusDiv.style.fontFamily = 'Poppins, Inter, Arial, sans-serif';
    statusDiv.style.zIndex = '9999';
    statusDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(statusDiv);
  }
  statusDiv.textContent = message;
  statusDiv.style.backgroundColor = isSuccess ? '#4BB543' : '#D8000C';
  statusDiv.style.color = '#fff';
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Function to download PDF file
function downloadDemoPDF(filename) {
  // Create a link element
  const link = document.createElement('a');
  link.href = filename; // Use the passed filename parameter
  link.download = filename;
  link.style.display = 'none';
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Show success message
  showMessageStatus('Download started!', true);
}

// Add click event listeners for footer links
document.addEventListener('DOMContentLoaded', function() {
  // Terms and conditions
  const termsElement = document.querySelector('.home-screen-text89');
  if (termsElement) {
    termsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_TC.pdf'));
  }
  
  // Privacy Policy
  const privacyElement = document.querySelector('.home-screen-text90');
  if (privacyElement) {
    privacyElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_PP.pdf'));
  }
  
  // FAQs
  const faqsElement = document.querySelector('.home-screen-text91');
  if (faqsElement) {
    faqsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_FAQ.pdf'));
  }
});

document.getElementById('contact-form-home').addEventListener('submit', function(event) {
  event.preventDefault();

  // Get form values
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Capitalize the first letter of the name
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Prepare the template parameters - use the exact variable names from your EmailJS template
  const templateParams = {
    name: capitalizedName,
    email: email,
    message: message
  };

  // Send the email using EmailJS v4
  emailjs.send('service_7ydfavx', 'template_kiqzfxn', templateParams)
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
      showMessageStatus('Message sent successfully!', true);
      document.getElementById('contact-form-home').reset();
    }, function(error) {
      console.log('FAILED...', error);
      showMessageStatus('Failed to send message. Please try again.', false);
    });
});