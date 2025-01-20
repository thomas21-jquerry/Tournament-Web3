import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook

const TournamentCreation = () => {
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [startTime, setStartTime] = useState('');
  const [gameType, setGameType] = useState('1vN');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();  // Initialize navigate hook

  const handleCreateTournament = async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('User not authenticated');
      setError('Please login to create a tournament');
      return;
    }

    const startTimeTimestamp = new Date(startTime).getTime();
    const endTimeTimestamp = new Date(endTime).getTime();
    try {
      setLoading(true);  // Set loading state to true
      const response = await axios.post(
        'http://localhost:5001/tournaments/create', 
        {
          name,
          entryFee,
          gameType,
          maxPlayers,
          startTime: startTimeTimestamp,
          endTime: endTimeTimestamp,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Send the token here
          }
        }
      );
      
      console.log('Tournament created:', response.data);
      
      // Navigate to the tournament details page using the tournament ID
      if (response.data && response.data.onchainId) {
        navigate(`/tournament/${response.data.onchainId}`);
      } else {
        setError('Failed to retrieve the created tournament');
      }
    } catch (err) {
      console.error('Error creating tournament:', err);
      setError('Error creating the tournament. Please try again.');
    } finally {
      setLoading(false);  // Set loading state to false after API call
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Create Tournament</h2>
      {error && <div style={styles.errorMessage}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Creating tournament, please wait...</div>
      ) : (
        <div style={styles.form}>
          <label style={styles.label}>
            Name:
            <input 
              style={styles.input}
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </label>
          
          <label style={styles.label}>
            Entry Fee (ETH):
            <input 
              style={styles.input}
              type="text" 
              value={entryFee} 
              onChange={(e) => setEntryFee(e.target.value)} 
            />
          </label>

          <label style={styles.label}>
            Max Players:
            <input 
              style={styles.input}
              type="number" 
              value={maxPlayers} 
              onChange={(e) => setMaxPlayers(e.target.value)} 
            />
          </label>
          
          <label style={styles.label}>
            Start Time:
            <input 
              style={styles.input}
              type="datetime-local" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
            />
          </label>
          
          <label style={styles.label}>
            End Time:
            <input 
              style={styles.input}
              type="datetime-local" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
            />
          </label>
          
          <label style={styles.label}>
            Game Type:
            <input 
              style={styles.input}
              type="text" 
              value={gameType} 
              onChange={(e) => setGameType(e.target.value)} 
            />
          </label>

          <button 
            style={styles.button} 
            onClick={handleCreateTournament}
          >
            Create Tournament
          </button>
        </div>
      )}
    </div>
  );
};

// Styles for the TournamentCreation component
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontSize: '1rem',
    color: '#333',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#007bff',
  }
};

export default TournamentCreation;
