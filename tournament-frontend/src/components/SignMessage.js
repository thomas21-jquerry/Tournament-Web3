// src/components/SignMessage.js

import React, { useState } from 'react';
import { ethers } from 'ethers';

const SignMessage = ({ address, message, authenticateUser }) => {
  const [error, setError] = useState('');
  
  const handleSignMessage = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signedMessage = await signer.signMessage(message);
      authenticateUser(signedMessage);
    } catch (err) {
      setError("Error signing message");
    }
  };

  return (
    <div>
      {address && <p>Wallet Address: {address}</p>}
      {message && <p>Message to Sign: {message}</p>}
      <button onClick={handleSignMessage}>Sign Message</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignMessage;
