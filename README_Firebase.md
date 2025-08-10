# Secure Gen AI - Sign Up Page

A modern sign-up page with Firebase authentication integration using the latest Firebase SDK v11.9.1.

## Features

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ Password Reset Functionality
- ✅ Real-time Form Validation
- ✅ Responsive Design
- ✅ Password Visibility Toggle
- ✅ Modern ES6 Modules
- ✅ Latest Firebase SDK (v11.9.1)

## Firebase Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `secure-gen-ai-auth`
4. Follow the setup wizard (disable Google Analytics if not needed)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. Enable "Google" authentication (optional):
   - Click "Google"
   - Toggle "Enable"
   - Add your support email
   - Click "Save"

### 3. Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app:
   - App nickname: `sign-up-web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
6. Copy the Firebase configuration object

### 4. Update Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 5. Test the Application

python -m http.server 8000

Then access your site at `http://localhost:8000/index.html`

1. Open `index.html` in your browser
2. Try creating an account with email/password
3. Test Google sign-in (if enabled)
4. Test password reset functionality
5. Use `test-firebase.html` to verify Firebase connection

## Project Structure

```
sign_up/
├── index.html          # Main HTML file with ES6 modules
├── index.js            # Firebase authentication logic (ES6 modules)
├── firebase-config.js  # Firebase configuration (ES6 modules)
├── style.css           # Main stylesheet
├── index.css           # Additional styles
├── test-firebase.html  # Firebase connection test page
├── public/             # Static assets
└── README.md           # This file
```

## Technical Details

### Firebase SDK Version
- **Version**: 11.9.1 (Latest)
- **Type**: ES6 Modules (Modern approach)
- **Import Method**: Direct CDN imports

### Key Features
- **Modern JavaScript**: Uses ES6 modules and async/await
- **Tree Shaking**: Only imports needed Firebase functions
- **Better Performance**: Smaller bundle size
- **Type Safety**: Better IDE support and error detection

## Security Notes

- Never commit your actual Firebase API keys to version control
- Use environment variables in production
- Enable appropriate security rules in Firebase
- Consider implementing rate limiting for authentication attempts
- Use HTTPS in production for secure authentication

## Troubleshooting

### Common Issues:

1. **"Cannot use import statement outside a module" error**
   - Ensure all script tags have `type="module"`
   - Check that you're serving files from a web server (not file:// protocol)

2. **"Failed to fetch module" error**
   - Make sure you're running from a web server (localhost)
   - Check network connectivity for Firebase CDN

3. **"auth is not defined" error**
   - Ensure `firebase-config.js` is loaded before `index.js`
   - Check that Firebase is properly initialized

4. **Google Sign-In not working**
   - Verify Google authentication is enabled in Firebase Console
   - Check that your domain is authorized for OAuth redirects

5. **Password reset emails not sending**
   - Ensure Email/Password authentication is enabled
   - Check spam folder for reset emails

### Development Server
To avoid CORS issues during development, use a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then access your site at `http://localhost:8000`

## Next Steps

After successful authentication setup, consider:

1. Creating a dashboard page for authenticated users
2. Implementing user profile management
3. Adding email verification
4. Setting up Firebase Hosting for deployment
5. Adding additional authentication providers (Facebook, Twitter, etc.)
6. Implementing Firebase Firestore for user data storage

## Support

For Firebase-specific issues, refer to the [Firebase Documentation](https://firebase.google.com/docs).

### Password Reset Email Issues

If you're not receiving password reset emails, follow these steps:

#### 1. Check Firebase Console Settings
- Go to Firebase Console → Authentication → Sign-in method
- Click on "Email/Password" provider
- Ensure "Password reset" is enabled
- Check if your domain is authorized (if you have domain restrictions)

#### 2. Verify Email Configuration
- Go to Firebase Console → Authentication → Templates
- Check if the "Password reset" template is properly configured
- You can customize the email template here

#### 3. Check Email Delivery
- **Wait 5-10 minutes** - emails can take time to deliver
- Check your **spam/junk folder**
- Verify the email address is correct
- Try with a different email address (Gmail, Outlook, etc.)

#### 4. Common Error Codes
- `auth/user-not-found`: Email is not registered in the system
- `auth/invalid-email`: Email format is invalid
- `auth/too-many-requests`: Too many reset attempts (wait 1 hour)
- `auth/operation-not-allowed`: Password reset is disabled in Firebase

#### 5. Debug Steps
1. Open browser console (F12)
2. Try the forgot password function
3. Check for any error messages in the console
4. Look for the debug logs we added

#### 6. Firebase Project Issues
- Ensure your Firebase project is on the **Blaze (pay-as-you-go) plan** if you're sending many emails
- Free tier has limitations on email sending
- Check if your project is suspended or has billing issues

#### 7. Alternative Solutions
If emails still don't work:
- Use a different email provider (Gmail, Outlook, etc.)
- Check if your email provider blocks Firebase emails
- Contact Firebase support if the issue persists 