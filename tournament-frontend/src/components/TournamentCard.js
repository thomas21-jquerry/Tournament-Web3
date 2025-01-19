import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate instead of useHistory

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();  // Use useNavigate for navigation

  const handleClick = () => {
    // Navigate to the tournament detail page when the card is clicked
    navigate(`/tournament/${tournament.onchainId}`);
  };

  return (
    <div style={styles.card} onClick={handleClick}>
      <h3>Tournament ID: {tournament.onchainId}</h3>
      <p><strong>Entry Fee:</strong> {tournament.entryFee} ETH</p>
      <p><strong>Max Players:</strong> {tournament.maxPlayers}</p>
      <p><strong>Start Time:</strong> {new Date(tournament.startTime).toLocaleString()}</p>
      <p><strong>Status:</strong> {tournament.isActive ? 'Active' : 'Finished'}</p>
    </div>
  );
};

// Styling for the TournamentCard component
const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '15px',
    margin: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
};

export default TournamentCard;
