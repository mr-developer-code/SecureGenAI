// Import Firebase Auth functions
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  fetchSignInMethodsForEmail
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
  const signUpBtn = document.querySelector('.sign-up-btn');
  const googleBtn = document.querySelector('.google-btn');
  const togglePassword = document.querySelector('#toggle-password');
  const passwordInput = document.querySelector('#password');
  const signinLink = document.querySelector('.signin-link');
  const forgotPasswordLink = document.querySelector('.forgot-password');

  // Debug: Check if elements are found
  console.log('Elements found:', {
    signUpBtn: !!signUpBtn,
    googleBtn: !!googleBtn,
    togglePassword: !!togglePassword,
    passwordInput: !!passwordInput,
    signinLink: !!signinLink,
    forgotPasswordLink: !!forgotPasswordLink
  });

  // Check for missing elements and warn
  const missingElements = [];
  if (!signUpBtn) missingElements.push('.sign-up-btn');
  if (!googleBtn) missingElements.push('.google-btn');
  if (!togglePassword) missingElements.push('#toggle-password');
  if (!passwordInput) missingElements.push('#password');
  if (!signinLink) missingElements.push('.signin-link');
  if (!forgotPasswordLink) missingElements.push('.forgot-password');

  if (missingElements.length > 0) {
    console.warn('⚠️ Missing HTML elements:', missingElements.join(', '));
    console.warn('Some functionality may not work properly. Please check your HTML structure.');
  }

  // Check if Firebase Auth is available
  if (!auth) {
    console.error('Firebase Auth is not available. Authentication features will be disabled.');
    showStatus('Firebase authentication is not available. Please check your configuration.', false);
    return;
  }

  console.log('Firebase Auth is available, setting up event listeners...');

  // Password toggle functionality
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.classList.toggle('active', type === 'text');
    });
  }

  // Sign Up functionality with Firebase
  if (signUpBtn) {
    signUpBtn.addEventListener('click', async () => {
      const name = document.querySelector('.input-field[id="name"]').value.trim();
      const email = document.querySelector('.input-field[id="email"]').value.trim();
      const password = document.querySelector('.input-field[id="password"]').value;
      
      if (!name || !email || !password) {
        showStatus('Please fill in all fields', false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('Please enter a valid email address.', false);
        document.querySelector('.input-field[id="email"]').focus();
        return;
      }

      // Basic password validation
      if (password.length < 6) {
        showStatus('Password must be at least 6 characters long.', false);
        document.querySelector('.input-field[id="password"]').focus();
        return;
      }

      try {
        // Show loading state
        signUpBtn.textContent = 'Creating Account...';
        signUpBtn.disabled = true;

        // Create user with Firebase
        createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          const user = userCredential.user;
          return updateProfile(user, { displayName: name });
        });
        
        // // Update user profile with display name
        // await updateProfile(userCredential.user, {
        //   displayName: name
        // });

        showStatus('Account created successfully! Welcome, ' + name, true);
        
        // Redirect to dashboard or home page
        setTimeout(() => {
          window.location.href = '/sign_in_page.html';
        }, 1500);
        
      } catch (error) {
        console.error('Error creating account:', error);
        
        let errorMessage = 'An error occurred while creating your account.';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Please sign in instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
        }
        
        showStatus(errorMessage, false);
      } finally {
        // Reset button state
        signUpBtn.textContent = 'Sign Up';
        signUpBtn.disabled = false;
      }
    });
  }

  // Google Sign In functionality
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        googleBtn.textContent = 'Signing Up...';
        googleBtn.disabled = true;

        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        showStatus('Successfully signed in with Google! Welcome, ' + result.user.displayName, true);
        
        // Redirect to dashboard or home page
        setTimeout(() => {
          window.location.href = '/sign_in_page.html';
        }, 1500);
        
      } catch (error) {
        console.error('Error signing in with Google:', error);
        
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
        }
        
        showStatus(errorMessage, false);
      } finally {
        // Reset button state
        googleBtn.textContent = 'Continue with Google';
        googleBtn.disabled = false;
      }
    });
  }

  // Forgot Password functionality
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      console.log('Forgot password link clicked!'); // Debug log
      e.preventDefault();
      
      const email = document.querySelector('.input-field[id="email"]').value.trim();
      console.log('Email value:', email); // Debug log
      
      if (!email) {
        console.log('Email is empty, showing alert'); // Debug log
        showStatus('Please enter your email address in the email field above before clicking "Forgot password?".', false);
        // Focus on the email field to help the user
        document.querySelector('.input-field[id="email"]').focus();
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format, showing alert'); // Debug log
        showStatus('Please enter a valid email address.', false);
        document.querySelector('.input-field[id="email"]').focus();
        return;
      }

      console.log('Email validation passed, sending reset email...'); // Debug log

      try {
        // Show loading state
        forgotPasswordLink.textContent = 'Sending...';
        forgotPasswordLink.style.pointerEvents = 'none';
        
        console.log('Sending password reset email...'); // Debug log
        console.log('Firebase Auth object:', auth); // Debug: Check if auth is available
        console.log('Email to send to:', email); // Debug: Confirm email
        
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent successfully'); // Debug log
        
        // More detailed success message with troubleshooting tips
        showStatus(`Password reset email sent to ${email}! Check your inbox and spam folder.`, true);
        
      } catch (error) {
        console.error('Error in forgot password process:', error);
        console.error('Error code:', error.code); // Debug: Log error code
        console.error('Error message:', error.message); // Debug: Log full error message
        
        let errorMessage = 'An error occurred while processing your request.';
        
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = `No account found with the email address "${email}". Would you like to create a new account instead?`;
            const userChoice = confirm(errorMessage);
            if (userChoice) {
              showStatus('Great! Please fill in your details above and click "Sign Up" to create a new account.', true);
              document.querySelector('.input-field[id="name"]').focus();
            }
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            showStatus(errorMessage, false);
            break;
          case 'auth/too-many-requests':
            errorMessage = `Too many password reset attempts for "${email}". Please wait 1 hour before trying again.`;
            showStatus(errorMessage, false);
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            showStatus(errorMessage, false);
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Password reset is not enabled for this project. Please contact support.';
            showStatus(errorMessage, false);
            break;
          default:
            errorMessage = `Error: ${error.message}`;
            showStatus(errorMessage, false);
        }
      } finally {
        // Reset link state
        forgotPasswordLink.textContent = 'Forgot password?';
        forgotPasswordLink.style.pointerEvents = 'auto';
      }
    });
  }

  // Sign In link functionality (for switching to sign in page)
  // if (signinLink) {
  //   signinLink.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     showStatus('Redirecting to Sign In page...', true);
  //     // You can redirect to a sign-in page here
  //     setTimeout(() => {
  //       window.location.href = '/404.html';
  //     }, 1500);
  //   });
  // }

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