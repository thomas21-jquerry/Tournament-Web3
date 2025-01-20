import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentCard from './TournamentCard';

const TournamentsList = () => {
  const [tournaments, setTournaments] = useState([]); // State to store the tournaments
  const [loading, setLoading] = useState(true); // Loading state to show when data is being fetched
  const [error, setError] = useState(''); // Error state to handle any API errors

  // Fetch tournaments from the backend API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          console.error('User not authenticated');
          setError('JWT token does not exist');
          return;
        }

        const response = await axios.get('http://localhost:5001/tournaments', {
          headers: {
            'Authorization': `Bearer ${token}`, // Add the token here
          }
        });
        
        setTournaments(response.data.tournaments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tournaments.');
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading tournaments...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.tournamentsContainer}>
        {tournaments.map((tournament) => (
          <div style={styles.cardContainer} key={tournament.onchainId}>
            <TournamentCard tournament={tournament} />
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f0f4f8', // Light background for the overall container
    minHeight: '100vh',
    padding: '20px', // Add some padding around the whole page
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#888',
  },
  error: {
    textAlign: 'center',
    fontSize: '20px',
    color: 'red',
  },
  tournamentsContainer: {
    display: 'flex',
    flexWrap: 'wrap', // Allow wrapping of items
    justifyContent: 'center', // Center the items horizontally
    gap: '20px', // Add some space between the cards
    marginTop: '20px', // Optional: add some space above the cards
  },
  cardContainer: {
    flex: '1 1 calc(33.33% - 20px)', // 3 cards in a row with gap
    boxSizing: 'border-box', // Ensure that padding doesn't affect width
    marginBottom: '20px', // Optional: space below each card
    backgroundColor: '#ffffff', // White background for each card
    borderRadius: '10px', // Rounded corners for the cards
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for the card
    overflow: 'hidden', // Ensure the rounded corners are respected
    minWidth: 'calc(33.33% - 20px)', // Ensure that the card doesn't shrink smaller than 1/3 of the container
    maxWidth: 'calc(33.33% - 20px)', // Ensure that the card doesn't grow beyond 1/3 of the container
  },
};

export default TournamentsList;
