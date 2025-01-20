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
      {/* Add the image here */}
      <img 
        src={`/colosseum.jpeg`}  // Path to the image in the public folder
        alt="Tournament"
        style={styles.image}  // Style for the image
      />
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
    textAlign: 'center', // Centering the content inside the card
  },
  image: {
    width: '100%', // Make the image fill the width of the card
    height: 'auto', // Maintain the aspect ratio of the image
    borderRadius: '5px', // Optional: rounded corners for the image
    marginBottom: '15px', // Space between the image and text
  },
};

export default TournamentCard;
