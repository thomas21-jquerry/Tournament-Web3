// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useEthereum } from '../context/EthereumContext';

const Navbar = () => {

    const { address, isAdmin } = useEthereum();

  // Function to format the address to show only the starting and ending letters
  const getShortenedAddress = (address) => {
    if (!address) return '';
    const start = address.slice(0, 6);  // First 4 characters + "0x"
    const end = address.slice(-4);      // Last 4 characters
    return `${start}...${end}`;
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <h1>Arena</h1>
      </div>
      <div style={styles.navItems}>
        {isAdmin ? (
          <>
            <Link to="/create-tournament" style={styles.navLink}>Create Tournament</Link>
            <a href="/admin-dashboard" style={styles.navLink}>Admin Dashboard</a>
          </>
        ) : (
          <>
            <a href="/dashboard" style={styles.navLink}>Dashboard</a>
            <span style={styles.navText}>Connected: {getShortenedAddress(address)}</span>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  navItems: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
  },
  navText: {
    color: '#fff',
    fontSize: '16px',
  }
};

export default Navbar;
