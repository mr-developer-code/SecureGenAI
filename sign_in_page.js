// Import Firebase Auth functions
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

function showStatus(message, isSuccess) {
  let statusDiv = document.getElementById('show-status-action');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'show-status-action';
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

document.addEventListener('DOMContentLoaded', function() {

  // Contact us
  const contactElement = document.querySelector('.signinscreen-text21');
  if (contactElement) {
    contactElement.addEventListener('click', () => window.location.href = '/contact_us_page.html');
  }
  // Terms and conditions
  const termsElement = document.querySelector('.signinscreen-text22');
  if (termsElement) {
    termsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_TC.pdf'));
  }
  
  // Privacy Policy
  const privacyElement = document.querySelector('.signinscreen-text23');
  if (privacyElement) {
    privacyElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_PP.pdf'));
  }
  
  // FAQs
  const faqsElement = document.querySelector('.signinscreen-text24');
  if (faqsElement) {
    faqsElement.addEventListener('click', () => downloadDemoPDF('pdfs/FYP_WEB_PDF_FAQ.pdf'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const signInBtn = document.querySelector('.sign-in-btn');
  const googleBtn = document.querySelector('.google-btn');
  const togglePassword = document.querySelector('#toggle-password');
  const passwordInput = document.querySelector('#password-input');
  const signupLink = document.querySelector('.signup-link');
  const forgotPasswordLink = document.querySelector('.forgot-password');

  // Password toggle functionality
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('active', type === 'text');
  });

  // Sign In functionality with Firebase
  signInBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.querySelector('.input-field[placeholder="Email"]').value.trim();
    const password = document.querySelector('.input-field[type="password"]').value;
    if (!email || !password) {
      showStatus('Please fill in both fields', false);
      return;
    }
    try {
      signInBtn.textContent = 'Signing In...';
      signInBtn.disabled = true;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showStatus('Login successful! Welcome, ' + (userCredential.user.displayName || userCredential.user.email), true);
      // Redirect to dashboard or home page
      setTimeout(() => { window.location.href = '/download_page.html'; }, 1500);
    } catch (error) {
      let errorMessage = 'An error occurred while signing in.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message;
      }
      showStatus(errorMessage, false);
    } finally {
      signInBtn.textContent = 'Sign in';
      signInBtn.disabled = false;
    }
  });

  // Google Sign In functionality
  googleBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      googleBtn.textContent = 'Signing in...';
      googleBtn.disabled = true;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      showStatus('Successfully signed in with Google! Welcome, ' + (result.user.displayName || result.user.email), true);
      setTimeout(() => { window.location.href = '/download_page.html'; }, 1500);
    } catch (error) {
      let errorMessage = 'An error occurred while signing in with Google.';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled.';
          break;
        default:
          errorMessage = error.message;
      }
      showStatus(errorMessage, false);
    } finally {
      googleBtn.textContent = 'Continue with Google';
      googleBtn.disabled = false;
    }
  });

  // Forgot Password functionality
  forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.querySelector('.input-field[placeholder="Email"]').value.trim();
    if (!email) {
      showStatus('Please enter your email address in the email field above before clicking "Forgot password?".', false);
      document.querySelector('.input-field[placeholder="Email"]').focus();
      return;
    }
    try {
      forgotPasswordLink.textContent = 'Sending...';
      forgotPasswordLink.style.pointerEvents = 'none';
      await sendPasswordResetEmail(auth, email);
      showStatus('Password reset email sent! Please check your inbox (and spam folder).', true);
    } catch (error) {
      let errorMessage = 'An error occurred while processing your request.';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = `No account found with the email address "${email}".`;
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many password reset attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          errorMessage = error.message;
      }
      showStatus(errorMessage, false);
    } finally {
      forgotPasswordLink.textContent = 'Forgot password?';
      forgotPasswordLink.style.pointerEvents = 'auto';
    }
  });

  // // Sign Up link functionality (for switching to sign up page)
  // signupLink.addEventListener('click', (e) => {
  //   e.preventDefault();
  //   // You can redirect to a sign-up page here
  //   window.location.href = '/404.html';
  // });

  // Listen for authentication state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is signed in:', user.displayName || user.email);
      // You can update UI here when user is signed in
    } else {
      console.log('User is signed out');
      // You can update UI here when user is signed out
    }
  });
});

