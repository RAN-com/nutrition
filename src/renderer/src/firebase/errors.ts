/**
 * Maps Firebase Authentication error codes to messages safe to show end users.
 *
 * Covers the Admin SDK codes from
 * https://firebase.google.com/docs/auth/admin/errors
 * plus the common client SDK codes (auth/email-already-in-use,
 * auth/wrong-password, auth/network-request-failed, ...), since those are what
 * you actually get from signInWithEmailAndPassword & co. in the browser/app.
 */

const GENERIC = 'Something went wrong. Please try again.'

// Messages that are safe and useful to show users.
const USER_MESSAGES: Record<string, string> = {
  // --- Sign in / credentials ---
  // Deliberately vague: don't reveal whether the email exists (account enumeration).
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',

  // --- Sign up ---
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/email-already-exists': 'An account with this email already exists.',
  'auth/phone-number-already-exists': 'An account with this phone number already exists.',
  'auth/uid-already-exists': 'This account already exists.',
  'auth/invalid-password': 'Password must be at least 6 characters long.',
  'auth/weak-password': 'Password must be at least 6 characters long.',
  'auth/invalid-phone-number': 'Please enter a valid phone number including country code.',
  'auth/invalid-display-name': 'Please enter a valid name.',
  'auth/invalid-photo-url': 'The profile photo link is not valid.',

  // --- Session / tokens ---
  'auth/id-token-expired': 'Your session has expired. Please sign in again.',
  'auth/session-cookie-expired': 'Your session has expired. Please sign in again.',
  'auth/id-token-revoked': "You've been signed out. Please sign in again.",
  'auth/session-cookie-revoked': "You've been signed out. Please sign in again.",
  'auth/invalid-id-token': 'Your session is invalid. Please sign in again.',
  'auth/requires-recent-login': 'For security, please sign in again to continue.',

  // --- Limits / network ---
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',

  // --- Provider config the user can't fix, but "not available" is a fair message ---
  'auth/operation-not-allowed': "This sign-in method isn't available right now.",

  // --- Email action links (password reset, verification) ---
  'auth/invalid-continue-uri': 'This link is invalid. Please request a new one.',
  'auth/unauthorized-continue-uri': 'This link is invalid. Please request a new one.',
  'auth/missing-continue-uri': 'This link is invalid. Please request a new one.'
}

// Codes that indicate a bug or server misconfiguration. Never show details to
// users: log them (see below) and show the generic message.
const DEVELOPER_ONLY = new Set([
  'auth/claims-too-large',
  'auth/insufficient-permission',
  'auth/internal-error',
  'auth/invalid-argument',
  'auth/invalid-claims',
  'auth/invalid-creation-time',
  'auth/invalid-disabled-field',
  'auth/invalid-dynamic-link-domain',
  'auth/invalid-email-verified',
  'auth/invalid-hash-algorithm',
  'auth/invalid-hash-block-size',
  'auth/invalid-hash-derived-key-length',
  'auth/invalid-hash-key',
  'auth/invalid-hash-memory-cost',
  'auth/invalid-hash-parallelization',
  'auth/invalid-hash-rounds',
  'auth/invalid-hash-salt-separator',
  'auth/invalid-last-sign-in-time',
  'auth/invalid-oauth-responsetype',
  'auth/invalid-page-token',
  'auth/invalid-password-hash',
  'auth/invalid-password-salt',
  'auth/invalid-provider-data',
  'auth/invalid-provider-id',
  'auth/invalid-session-cookie-duration',
  'auth/invalid-uid',
  'auth/invalid-user-import',
  'auth/maximum-user-count-exceeded',
  'auth/missing-android-pkg-name',
  'auth/missing-hash-algorithm',
  'auth/missing-ios-bundle-id',
  'auth/missing-oauth-client-secret',
  'auth/missing-uid',
  'auth/project-not-found',
  'auth/reserved-claims'
])

function extractCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null) {
    const e = error as { code?: unknown; errorInfo?: { code?: unknown } }
    // Client SDK: error.code. Admin SDK: error.code or error.errorInfo.code.
    if (typeof e.code === 'string') return e.code
    if (typeof e.errorInfo?.code === 'string') return e.errorInfo.code
  }
  return undefined
}

export function getAuthErrorMessage(error: object): string {
  const code = extractCode(error)
  if (!code) return GENERIC

  const message = USER_MESSAGES[code]
  if (message) return message

  if (DEVELOPER_ONLY.has(code)) {
    console.error(`[auth] developer error: ${code}`, error)
    return GENERIC
  }

  // Unknown code: log it so you can add it to the map later.
  console.warn(`[auth] unmapped error code: ${code}`, error)
  return GENERIC
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------
//
// try {
//   await signInWithEmailAndPassword(auth, email, password);
// } catch (err) {
//   setError(getAuthErrorMessage(err));
// }
