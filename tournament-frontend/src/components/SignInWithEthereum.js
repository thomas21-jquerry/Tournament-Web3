import React, { useState, useEffect } from 'react';
import { useEthereum } from '../context/EthereumContext';
import axios from 'axios';
import { SiweMessage } from 'siwe';
import TournamentCreation from './TournamentCreation';
import TournamentsList from './TournamentList';
import { ethers } from 'ethers';

const SignInWithEthereum = () => {
  const { signer, address, contract, isAdmin } = useEthereum();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (address) {
      const checksummedAddress = ethers.getAddress(address);
      const message1 = createSiweMessage(checksummedAddress, 'Sign in with Ethereum to the app.');
      setMessage(message1);
    }
  }, [address]);

  const createSiweMessage = (address, statement) => {
    return new SiweMessage({
      scheme: window.location.protocol.slice(0, -1),
      domain: window.location.host,
      address,
      statement,
      uri: window.location.origin,
      version: '1',
      chainId: '1',
    }).prepareMessage();
  };

  const authenticateUser = async (signature) => {
    try {
      const response = await axios.post('http://localhost:5001/user/signin', {
        siweMessage: message,
        signature,
      });
      console.log("Authentication response:", response); // Log the response for debugging
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        setIsAuthenticated(true);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      // Log the error object to see what's going wrong
      console.error("Error during authentication:", err);
      setError(`Error during authentication: ${err.message || err}`);
    }
  };

  const checkIfBadgeReceived = async (playerAddress) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      const badgeReceived = await contract.hasReceivedBadge(playerAddress);
      return badgeReceived;
    } catch (err) {
      console.error(err);
      setError('Error checking badge status');
      return false;
    }
  };


  const handleSignMessage = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!signer) {
      setError('Signer not available');
      return;
    }

    try {
      const signedMessage = await signer.signMessage(message);
      setSignature(signedMessage);
      authenticateUser(signedMessage);
    } catch (err) {
      console.error("Error signing message:", err);
      setError(`Error signing message: ${err.message || err}`);
    }
  };

  useEffect(() => {
    const mintBadge = async () => {
      if (!contract) {
        setError('Contract not initialized');
        return;
      }

      // Check if the player has already received a badge
      const hasBadge = await checkIfBadgeReceived(address);

      if (!hasBadge) {
        try {
          const tx = await contract.mintBadge(); // Call mintBadge method on contract
          await tx.wait(); // Wait for the transaction to be mined
          setError('');
          alert("Badge minted successfully!");
        } catch (err) {
          console.error(err);
          setError('Error minting badge');
        }
      } else {
        // alert("Welcome to Arena! You have already received a badge.");
      }
    };

    if (isAuthenticated) {
      mintBadge(); // Trigger minting automatically after authentication
    }
  }, [isAuthenticated]);

  useEffect(()=>{
    if (!isAuthenticated) {
      const token = localStorage.getItem('jwt_token');
      console.log(token, signer, isAdmin)
      if( signer && token){
        setIsAuthenticated(true)
      }
    }
  },[signer])

  return (
    <div>
      {!isAuthenticated && <button onClick={handleSignMessage}>Sign Message</button>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isAuthenticated && isAdmin && <div><TournamentCreation /></div>}
      {isAuthenticated && !isAdmin && <TournamentsList/>}
    </div>
  );
};

export default SignInWithEthereum;
