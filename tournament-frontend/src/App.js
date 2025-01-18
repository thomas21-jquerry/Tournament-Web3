// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { EthereumProvider } from './context/EthereumContext';
import Navbar from './components/Navbar';
import SignInWithEthereum from './components/SignInWithEthereum';
import TournamentCreation from './components/TournamentCreation';

function App() {
  return (
    <EthereumProvider>
      <Router>
        <div>
          <Navbar /> 
          <Routes>
            {/* Correct usage of the element prop in React Router v6 */}
            <Route path="/" element={<SignInWithEthereum />} />
            <Route path="/create-tournament" element={<TournamentCreation />} />
          </Routes>
        </div>
      </Router>
    </EthereumProvider>
  );
}

export default App;
