// Download functionality for the solution.txt file

// Function to calculate SHA256 hash
function calculateHash(data) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
    .then(hashBuffer => {
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    });
}

// Function to decode base64 to binary
function base64ToBinary(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function showDownloadStatus(message, isSuccess) {
  let statusDiv = document.getElementById('download-status-message');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'download-status-message';
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
  }, 1500);
}

// Function to show fetching prompt
function showFetchingPrompt() {
  let fetchingDiv = document.getElementById('fetching-prompt');
  if (!fetchingDiv) {
    fetchingDiv = document.createElement('div');
    fetchingDiv.id = 'fetching-prompt';
    fetchingDiv.style.position = 'fixed';
    fetchingDiv.style.top = '0';
    fetchingDiv.style.left = '0';
    fetchingDiv.style.width = '100vw';
    fetchingDiv.style.height = '100vh';
    fetchingDiv.style.background = 'rgba(0,0,0,0.7)';
    fetchingDiv.style.zIndex = '10060';
    fetchingDiv.style.display = 'flex';
    fetchingDiv.style.justifyContent = 'center';
    fetchingDiv.style.alignItems = 'center';
    fetchingDiv.innerHTML = `
      <div style="background:#fff; padding:32px 24px; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.18); max-width:90vw; width:350px; text-align:center; position:relative;">
        <div style="margin-bottom:20px;">
          <div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto;"></div>
        </div>
        <span style="font-size:1.15rem; font-family:Poppins,Inter,sans-serif; color:#222;">Files are being fetched from server...</span>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
    document.body.appendChild(fetchingDiv);
  } else {
    fetchingDiv.style.display = 'flex';
  }
}

// Function to hide fetching prompt
function hideFetchingPrompt() {
  const fetchingDiv = document.getElementById('fetching-prompt');
  if (fetchingDiv) {
    fetchingDiv.style.display = 'none';
  }
}

async function downloadSolution(event) {
  if (event) event.preventDefault();

  // Show fetching prompt
  showFetchingPrompt();

  try {
    // Fetch files from server
    const response = await fetch('https://serverget.huzaifa.cloud/api/fetch-file');
    const data = await response.json();

    if (data.status !== 'success') {
      hideFetchingPrompt();
      showDownloadStatus(data.message || 'Failed to fetch files from server.', false);
      return;
    }

    // Verify hashes
    const zipBinary = base64ToBinary(data.zip_data);
    const txtBinary = base64ToBinary(data.txt_data);

    // Calculate hashes for verification
    const zipHash = await crypto.subtle.digest('SHA-256', zipBinary)
      .then(hashBuffer => Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));

    const txtHash = await crypto.subtle.digest('SHA-256', txtBinary)
      .then(hashBuffer => Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));

    // Verify hashes
    if (zipHash !== data.zip_hash || txtHash !== data.txt_hash) {
      hideFetchingPrompt();
      showDownloadStatus('File integrity check failed. Retrying...', false);
      
      // Retry once
      setTimeout(() => {
        downloadSolution(event);
      }, 1000);
      return;
    }

    // Create and download files
    const zipBlob = new Blob([zipBinary], { type: 'application/zip' });
    const txtBlob = new Blob([txtBinary], { type: 'application/pdf' });

    // Download zip file
    const zipLink = document.createElement('a');
    zipLink.href = URL.createObjectURL(zipBlob);
    zipLink.download = data.zip_filename;
    document.body.appendChild(zipLink);
    zipLink.click();
    document.body.removeChild(zipLink);

    // Download PDF file
    const txtLink = document.createElement('a');
    txtLink.href = URL.createObjectURL(txtBlob);
    txtLink.download = data.txt_filename;
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);

    // Clean up object URLs
    setTimeout(() => {
      URL.revokeObjectURL(zipLink.href);
      URL.revokeObjectURL(txtLink.href);
    }, 1000);

    // Hide fetching prompt
    hideFetchingPrompt();

    // Show the download modal
    setTimeout(function() {
      var modal = document.getElementById('download-modal');
      if (modal) {
        modal.style.display = 'flex';
        // Animate OK button
        var okBtn = document.getElementById('close-modal-btn');
        if (okBtn) {
          okBtn.classList.remove('animate__animated', 'animate__pulse'); // reset
          void okBtn.offsetWidth; // reflow for restart
          okBtn.classList.add('animate__animated', 'animate__pulse');
          okBtn.addEventListener('animationend', function handler() {
            okBtn.classList.remove('animate__animated', 'animate__pulse');
            okBtn.removeEventListener('animationend', handler);
          });
        }
      }
    }, 500);

    showDownloadStatus('Files downloaded successfully!', true);

  } catch (error) {
    hideFetchingPrompt();
    console.error('Error fetching files:', error);
    showDownloadStatus('Failed to fetch files from server.', false);
    showRefreshPrompt();
  }
}

// Add this helper to show the refresh modal
function showRefreshPrompt() {
  console.log('Showing refresh prompt');
  // Hide any other modals/status
  const modals = [
    'download-modal', 'progress-modal', 'uninstalled-packages-modal', 'download-status-message'
  ];
  modals.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Check if modal exists, else create
  let refreshModal = document.getElementById('refresh-modal');
  if (!refreshModal) {
    refreshModal = document.createElement('div');
    refreshModal.id = 'refresh-modal';
    refreshModal.style.position = 'fixed';
    refreshModal.style.top = '0';
    refreshModal.style.left = '0';
    refreshModal.style.width = '100vw';
    refreshModal.style.height = '100vh';
    refreshModal.style.background = 'rgba(0,0,0,0.7)';
    refreshModal.style.zIndex = '10050'; // Make sure it's on top
    refreshModal.style.display = 'flex';
    refreshModal.style.justifyContent = 'center';
    refreshModal.style.alignItems = 'center';
    refreshModal.innerHTML = `
      <div style="background:#fff; padding:32px 24px; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.18); max-width:90vw; width:350px; text-align:center; position:relative;">
        <span style="font-size:1.15rem; font-family:Poppins,Inter,sans-serif; color:#222;">Server is busy or files are missing.<br>Please refresh the page and try again later.</span>
        <br><br>
        <button id="refresh-modal-btn" style="padding:8px 24px; background:#007bff; color:#fff; border:none; border-radius:6px; font-size:1rem; cursor:pointer;">Refresh</button>
      </div>
    `;
    document.body.appendChild(refreshModal);
    document.getElementById('refresh-modal-btn').onclick = function() {
      window.location.reload();
    };
  } else {
    refreshModal.style.display = 'flex';
    refreshModal.style.zIndex = '10050';
  }
}

// Function to show IP address prompt
function showIPAddressPrompt() {
  return new Promise((resolve, reject) => {
    // Check if modal exists, else create
    let ipModal = document.getElementById('ip-address-modal');
    if (!ipModal) {
      ipModal = document.createElement('div');
      ipModal.id = 'ip-address-modal';
      ipModal.style.position = 'fixed';
      ipModal.style.top = '0';
      ipModal.style.left = '0';
      ipModal.style.width = '100vw';
      ipModal.style.height = '100vh';
      ipModal.style.background = 'rgba(0,0,0,0.7)';
      ipModal.style.zIndex = '10050';
      ipModal.style.display = 'flex';
      ipModal.style.justifyContent = 'center';
      ipModal.style.alignItems = 'center';
      ipModal.innerHTML = `
        <div style="background:#fff; padding:32px 24px; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.18); max-width:90vw; width:400px; text-align:center; position:relative;">
          <h3 style="font-size:1.25rem; font-family:Poppins,Inter,sans-serif; color:#222; margin-bottom:16px;">Enter IP Address of your main interface card</h3>
          <p style="font-size:1rem; font-family:Poppins,Inter,sans-serif; color:#666; margin-bottom:20px; line-height:1.5;">
            To run this command on terminal: <code style="background:#f5f5f5; padding:2px 6px; border-radius:4px;">ip a | grep inet</code><br>
            The address should not be a local address.
          </p>
          <input type="text" id="ip-address-input" placeholder="Enter IP address (e.g., 192.168.1.100)" 
                 style="width:100%; padding:12px; border:2px solid #ddd; border-radius:6px; font-size:1rem; margin-bottom:20px; box-sizing:border-box;">
          <div style="display:flex; gap:12px; justify-content:center;">
            <button id="ip-modal-cancel-btn" style="padding:10px 20px; background:#6c757d; color:#fff; border:none; border-radius:6px; font-size:1rem; cursor:pointer;">Cancel</button>
            <button id="ip-modal-submit-btn" style="padding:10px 20px; background:#007bff; color:#fff; border:none; border-radius:6px; font-size:1rem; cursor:pointer;">Submit</button>
          </div>
        </div>
      `;
      document.body.appendChild(ipModal);
      
      // Add event listeners
      document.getElementById('ip-modal-submit-btn').onclick = function() {
        const ipAddress = document.getElementById('ip-address-input').value.trim();
        if (ipAddress) {
          ipModal.style.display = 'none';
          resolve(ipAddress);
        } else {
          alert('Please enter a valid IP address');
        }
      };
      
      document.getElementById('ip-modal-cancel-btn').onclick = function() {
        ipModal.style.display = 'none';
        reject(new Error('IP address input cancelled'));
      };
      
      // Allow Enter key to submit
      document.getElementById('ip-address-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          document.getElementById('ip-modal-submit-btn').click();
        }
      });
    } else {
      ipModal.style.display = 'flex';
      ipModal.style.zIndex = '10050';
      
      // Update event listeners for existing modal
      document.getElementById('ip-modal-submit-btn').onclick = function() {
        const ipAddress = document.getElementById('ip-address-input').value.trim();
        if (ipAddress) {
          ipModal.style.display = 'none';
          resolve(ipAddress);
        } else {
          alert('Please enter a valid IP address');
        }
      };
      
      document.getElementById('ip-modal-cancel-btn').onclick = function() {
        ipModal.style.display = 'none';
        reject(new Error('IP address input cancelled'));
      };
    }
  });
}

// Additional utility functions can be added here
function initializeDownloadPage() {
  // Get the allow and install button by ID
  const allowInstallBtn = document.getElementById('allow-install-btn');
  const allowInstallBtnText = document.getElementById('allow-install-btn-text');
  
  if (allowInstallBtn) {
    let isFirstClick = true;
    
    allowInstallBtn.addEventListener('click', (event) => {
      if (isFirstClick) {
        // First: Fetch files from server with hash verification
        downloadSolution(event);
        allowInstallBtnText.textContent = 'Continue to Dashboard';
        isFirstClick = false;
      } else {
        // Second click: Redirect to dashboard
        // Store IP address in localStorage for dashboard page
        if (window.currentIPAddress) {
          localStorage.setItem('dashboardIPAddress', window.currentIPAddress);
        }
        window.location.href = '/dashboard_page.html';
      }
    });
    
    console.log('Download functionality initialized');
  } else {
    console.error('Allow and Install button not found');
  }
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

// Removed API activation function - no longer needed

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeDownloadPage();
}); 

document.addEventListener('DOMContentLoaded', function() {
  // Terms and conditions
  const termsElement = document.querySelector('.download-screen-text26');
  if (termsElement) {
    termsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_TC.pdf'));
  }
  
  // Privacy Policy
  const privacyElement = document.querySelector('.download-screen-text27');
  if (privacyElement) {
    privacyElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_PP.pdf'));
  }
  
  // FAQs
  const faqsElement = document.querySelector('.download-screen-text28');
  if (faqsElement) {
    faqsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_FAQ.pdf'));
  }
});

// Modal close button logic
document.addEventListener('DOMContentLoaded', function() {
  var closeModalBtn = document.getElementById('close-modal-btn');
  var modal = document.getElementById('download-modal');
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', function() {
      // Animate on click
      closeModalBtn.classList.remove('animate__animated', 'animate__tada');
      void closeModalBtn.offsetWidth;
      closeModalBtn.classList.add('animate__animated', 'animate__tada');
      closeModalBtn.addEventListener('animationend', function handler() {
        closeModalBtn.classList.remove('animate__animated', 'animate__tada');
        closeModalBtn.removeEventListener('animationend', handler);
        modal.style.display = 'none';
        // Go directly to progress bar
        showProgressBar();
      });
    });
  }
});

// Removed password modal logic - flow goes directly to progress bar

// Function to show progress bar
function showProgressBar() {
  // Go directly to progress bar without API checks
  showProgressBarAfterActivation();
}

async function showProgressBarAfterActivation() {
  try {
    // First prompt for IP address
    const ipAddress = await showIPAddressPrompt();
    
    // Store IP address globally for use in other functions
    window.currentIPAddress = ipAddress;
    
    // First check for uninstalled packages with IP address
    const uninstalledResponse = await fetch('https://apiget.huzaifa.cloud/api/check-uninstalled-packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: ipAddress })
    });
    
    const uninstalledData = await uninstalledResponse.json();
    
    if (uninstalledData.status === 'need_installation') {
      // Show uninstalled packages modal
      var uninstalledModal = document.getElementById('uninstalled-packages-modal');
      if (uninstalledModal) {
        uninstalledModal.style.display = 'flex';
        // Store packages for PDF generation
        window.packageList = uninstalledData.lines || [];
      }
    } else {
      // Show progress bar normally
      showProgressBarInternal(ipAddress);
    }
  } catch (error) {
    console.error('Error in progress bar activation:', error);
    // Default to progress bar on error (without IP address)
    showProgressBarInternal();
  }
}

// Internal function to show progress bar
function showProgressBarInternal(ipAddress) {
  var progressModal = document.getElementById('progress-modal');
  var progressBar = document.getElementById('progress-bar');
  var progressPercent = document.getElementById('progress-percent');
  var progressMessage = document.getElementById('progress-message');
  if (progressModal && progressBar && progressPercent && progressMessage) {
    progressModal.style.display = 'flex';
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    progressMessage.textContent = 'Processing, please wait...';
    // Poll for progress
    var pollInterval = setInterval(function() {
      // Use the provided IP address or fall back to stored one
      const address = ipAddress || window.currentIPAddress;
      
      if (!address) {
        progressMessage.textContent = 'Error: No IP address provided.';
        return;
      }
      
      fetch('https://apiget.huzaifa.cloud/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: address })
      })
        .then(resp => resp.json())
        .then(data => {
          var percent = data.progress || 0;
          progressBar.style.width = percent + '%';
          progressPercent.textContent = percent + '%';
          if (percent >= 100) {
            progressMessage.textContent = 'Completed!';
            setTimeout(function() {
              progressModal.style.display = 'none';
            }, 800);
            clearInterval(pollInterval);
          }
        })
        .catch(() => {
          progressMessage.textContent = 'Error fetching progress.';
        });
    }, 500);
  }
}

// Removed re-run modal logic - no longer needed without password flow

// Removed periodic password re-enter check - no longer needed

// Uninstalled packages modal logic
document.addEventListener('DOMContentLoaded', function() {
  var downloadPackagesBtn = document.getElementById('download-packages-btn');
  var closeUninstalledModalBtn = document.getElementById('close-uninstalled-modal-btn');
  var uninstalledModal = document.getElementById('uninstalled-packages-modal');
  
  if (downloadPackagesBtn && uninstalledModal) {
    downloadPackagesBtn.addEventListener('click', function() {
      // Animate on click
      downloadPackagesBtn.classList.remove('animate__animated', 'animate__tada');
      void downloadPackagesBtn.offsetWidth;
      downloadPackagesBtn.classList.add('animate__animated', 'animate__tada');
      downloadPackagesBtn.addEventListener('animationend', function handler() {
        downloadPackagesBtn.classList.remove('animate__animated', 'animate__tada');
        downloadPackagesBtn.removeEventListener('animationend', handler);
      });
      
      // Generate and download PDF
      generateAndDownloadPDF();
    });
  }
  
  if (closeUninstalledModalBtn && uninstalledModal) {
    closeUninstalledModalBtn.addEventListener('click', function() {
      // Animate on click
      closeUninstalledModalBtn.classList.remove('animate__animated', 'animate__tada');
      void closeUninstalledModalBtn.offsetWidth;
      closeUninstalledModalBtn.classList.add('animate__animated', 'animate__tada');
      closeUninstalledModalBtn.addEventListener('animationend', function handler() {
        closeUninstalledModalBtn.classList.remove('animate__animated', 'animate__tada');
        closeUninstalledModalBtn.removeEventListener('animationend', handler);
        uninstalledModal.style.display = 'none';
      });
    });
  }
});

// Function to generate and download PDF
function generateAndDownloadPDF() {
  if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
    console.error('jsPDF library not loaded');
    return;
  }

  const doc = new window.jspdf.jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Uninstalled Packages List', 20, 20);

  // Content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  let yPosition = 40;
  const packages = window.packageList || [];

  packages.forEach((package, index) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(package.trim(), 20, yPosition);
    yPosition += 10;
  });

  // Download the PDF
  doc.save('uninstalled_packages.pdf');
}