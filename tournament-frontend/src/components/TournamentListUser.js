import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentCard from './TournamentCard';
import { useEthereum } from '../context/EthereumContext';

const TournamentsListUser = () => {
  const [tournaments, setTournaments] = useState([]); // State to store the tournaments
  const [loading, setLoading] = useState(true); // Loading state to show when data is being fetched
  const [error, setError] = useState(''); // Error state to handle any API errors
  const { address } = useEthereum();
  // Fetch tournaments from the backend API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          console.error('User not authenticated');
          setError('jwt do not exist')
          return;
        }
        console.log(address)
        const response = await axios.get(`http://localhost:5001/tournaments/user/${address}`, {
            headers: {
              'Authorization': `Bearer ${token}`,  // Add the token here
            }
        });
        setTournaments(response.data.tournaments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tournaments.');
        setLoading(false);
      }
    };
    if(address){
        fetchTournaments();
    }
    
  }, [address]);

  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Your Tournament</h1>
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
  },
};

export default TournamentsListUser;
