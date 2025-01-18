// src/components/ConnectWallet.js

import React from 'react';

const ConnectWallet = ({ handleConnectWallet }) => {
  return (
    <div>
      <button onClick={handleConnectWallet}>Connect Wallet</button>
    </div>
  );
};

export default ConnectWallet;
