import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { SiweMessage } from 'siwe';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../utils/constants';

const SignInWithEthereum = () => {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [scheme, setScheme] = useState(window.location.protocol.slice(0, -1));
  const [domain, setDomain] = useState(window.location.host);
  const [origin, setOrigin] = useState(window.location.origin);
  const [contract, setContract] = useState(null);

  // Replace with your contract's address and ABI

  // Initialize ethers provider and contract
  const initializeContract = (provider) => {
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(contractInstance);
  };

  // Connect the wallet and request user account
  const handleConnectWallet = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        setAddress(userAddress);
        initializeContract(provider);  // Initialize contract here

        const message1 = createSiweMessage(
          userAddress, 
          'Sign in with Ethereum to the app.'
        );
        
        setMessage(message1);
      } catch (err) {
        console.error(err);
        setError("Error connecting to wallet");
      }
    } else {
      setError("Please install MetaMask or another Web3 wallet");
    }
  };

  // Sign the generated message
  const handleSignMessage = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signedMessage = await signer.signMessage(message);
      
      setSignature(signedMessage);
      authenticateUser(signedMessage);
    } catch (err) {
      console.log(err)
      setError("Error signing message");
    }
  };

  // Create a SIWE message object
  function createSiweMessage(address, statement) {
    const message = new SiweMessage({
      scheme,
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId: '1',
    });
    return message.prepareMessage();
  }

  // Authenticate the user with the signed message
  const authenticateUser = async (signature) => {
    try {
      const response = await axios.post('http://localhost:5001/user/signin', {
        siweMessage: message,
        signature: signature,
      });

      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        setIsAuthenticated(true); // Set authenticated status to true
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Error during authentication');
    }
  };

  // Check if the player has already received a badge
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

  // Automatically mint the badge once authenticated
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
        alert("You have already received a badge.");
      }
    };

    if (isAuthenticated) {
      mintBadge(); // Trigger minting automatically after authentication
    }
  }, [isAuthenticated, address, contract]);

  return (
    <div>
      <button onClick={handleConnectWallet}>Connect Wallet</button>
      
      {address && <p>Wallet Address: {address}</p>}
      {message && <p>Message to Sign: {message}</p>}
      
      <button onClick={handleSignMessage}>Sign Message</button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isAuthenticated && <p>Authenticated successfully!</p>}
    </div>
  );
};

export default SignInWithEthereum;
