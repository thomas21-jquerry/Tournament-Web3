import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook

const TournamentCreation = () => {
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [startTime, setStartTime] = useState('');
  const [gameType, setGameType] = useState('1vN');
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('');
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
      const response = await axios.post(
        'http://localhost:5001/tournaments/create', 
        {
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
    }
  };

  return (
    <div>
      <h2>Create Tournament</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <label>
        Name:
        <input 
          type="string" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </label>
      
      <label>
        Entry Fee (ETH):
        <input 
          type="string" 
          value={entryFee} 
          onChange={(e) => setEntryFee(e.target.value)} 
        />
      </label>
      <br />
      <label>
        Max Players:
        <input 
          type="number" 
          value={maxPlayers} 
          onChange={(e) => setMaxPlayers(e.target.value)} 
        />
      </label>
      <br />
      <label>
        Start Time:
        <input 
          type="datetime-local" 
          value={startTime} 
          onChange={(e) => setStartTime(e.target.value)} 
        />
      </label>
      <br />
      <label>
        End Time:
        <input 
          type="datetime-local" 
          value={endTime} 
          onChange={(e) => setEndTime(e.target.value)} 
        />
      </label>
      <br />
      <label>
        Game Type:
        <input 
          type="string" 
          value={gameType} 
          onChange={(e) => setGameType(e.target.value)} 
        />
      </label>
      <br />
      <button onClick={handleCreateTournament}>Create Tournament</button>
    </div>
  );
};

export default TournamentCreation;
