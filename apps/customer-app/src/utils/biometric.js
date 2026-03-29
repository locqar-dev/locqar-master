/**
 * Biometric Authentication Utility
 * Uses Web Authentication API (WebAuthn) for fingerprint/face recognition
 */

export const BiometricAuth = {
  // Check if biometric authentication is available
  isAvailable: async () => {
    if (!window.PublicKeyCredential) {
      return false;
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  },

  // Check if user has biometric credentials stored
  hasCredentials: () => {
    return localStorage.getItem('biometric_credential_id') !== null;
  },

  // Register biometric credentials for a user
  register: async (username) => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported');
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "LocQar",
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(username),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },  // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // Store credential ID for later authentication
      if (credential) {
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem('biometric_credential_id', credentialId);
        localStorage.setItem('biometric_username', username);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric registration error:', error);
      throw error;
    }
  },

  // Authenticate using biometric
  authenticate: async () => {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported');
      }

      const credentialId = localStorage.getItem('biometric_credential_id');
      if (!credentialId) {
        throw new Error('No biometric credentials found');
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [{
          id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: "required",
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        const username = localStorage.getItem('biometric_username');
        return { success: true, username };
      }

      return { success: false };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  },

  // Remove biometric credentials
  remove: () => {
    localStorage.removeItem('biometric_credential_id');
    localStorage.removeItem('biometric_username');
  },

  // Get stored username
  getUsername: () => {
    return localStorage.getItem('biometric_username');
  }
};
