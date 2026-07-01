const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters long.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
  "auth/requires-recent-login": "Please sign out and sign in again before changing your password.",
  "auth/missing-password": "Please enter your password.",
};

export function mapFirebaseAuthError(error) {
  if (!error?.code) {
    return error?.message || "An authentication error occurred.";
  }
  return AUTH_ERROR_MESSAGES[error.code] || error.message || "An authentication error occurred.";
}
