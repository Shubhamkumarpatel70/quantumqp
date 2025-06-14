import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FingerprintAuth = ({ onSuccess, onError }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsAvailable(available);
        })
        .catch((err) => {
          console.error('Error checking fingerprint availability:', err);
          setIsAvailable(false);
        });
    }
  }, []);

  const handleFingerprintAuth = async () => {
    if (!isAvailable) {
      onError('Fingerprint authentication is not available on this device');
      return;
    }

    setIsAuthenticating(true);
    try {
      // Get challenge from server
      const { data: { challenge } } = await axios.get('http://localhost:5000/api/auth/fingerprint-challenge');

      // Create credentials
      const publicKeyOptions = {
        challenge: new Uint8Array(challenge),
        rp: {
          name: "Quantum QP",
          id: window.location.hostname
        },
        user: {
          id: new Uint8Array(16),
          name: localStorage.getItem('user') || 'user',
          displayName: localStorage.getItem('user') || 'user'
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 } // ES256
        ],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false
        }
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      });

      // Send credential to server
      const response = await axios.post('http://localhost:5000/api/auth/fingerprint-verify', {
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
          },
          type: credential.type
        }
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        onSuccess(response.data);
      } else {
        onError('Fingerprint authentication failed');
      }
    } catch (err) {
      console.error('Fingerprint authentication error:', err);
      onError('Fingerprint authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleFingerprintAuth}
        disabled={isAuthenticating}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isAuthenticating ? (
          'Authenticating...'
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Login with Fingerprint
          </>
        )}
      </button>
    </div>
  );
};

export default FingerprintAuth; 