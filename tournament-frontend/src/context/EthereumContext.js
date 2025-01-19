import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../utils/constants';

const EthereumContext = createContext();

export const useEthereum = () => {
  return useContext(EthereumContext);
};

export const EthereumProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const ADMIN_ADDRESS = process.env.REACT_APP_ADMIN_ADDRESS?.toLowerCase();

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(tempProvider);
      
      const loadSigner = async () => {
        try {
          // Check if accounts are already available
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // If already connected, set address and signer
            const tempSigner = await tempProvider.getSigner();
            setSigner(tempSigner);
            setAddress(ethers.getAddress(accounts[0]));
            initializeContract(tempSigner);

            // Check if the user is an admin
            if (ADMIN_ADDRESS && accounts[0].toLowerCase() === ADMIN_ADDRESS) {
              setIsAdmin(true);
            }
          } else {
            // Request accounts if not connected
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const tempSigner = await tempProvider.getSigner();
            const tempAddress = await tempSigner.getAddress();
            setSigner(tempSigner);
            setAddress(ethers.getAddress(tempAddress));
            initializeContract(tempSigner);

            // Check if the user is an admin
            if (ADMIN_ADDRESS && tempAddress.toLowerCase() === ADMIN_ADDRESS) {
              setIsAdmin(true);
            }
          }
        } catch (err) {
          console.error("Error loading signer", err);
          setError("Please install MetaMask or another Ethereum wallet.");
        }
      };

      loadSigner();
    } else {
      setError("Ethereum provider not detected. Please install MetaMask.");
    }
  }, []);

  // Initialize contract once signer is available
  const initializeContract = (signer) => {
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(contractInstance);
  };

  return (
    <EthereumContext.Provider value={{ provider, signer, address, contract, isAdmin, error }}>
      {children}
    </EthereumContext.Provider>
  );
};
