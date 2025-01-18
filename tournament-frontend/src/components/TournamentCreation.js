// src/components/TournamentCreation.js

import React, { useState } from 'react';
import axios from 'axios';

const TournamentCreation = () => {
  const [entryFee, setEntryFee] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [startTime, setStartTime] = useState('');
  const [gameType, setGameType] = useState("1vN")

  const handleCreateTournament = async() => {
    const token = localStorage.getItem('jwt_token');
  if (!token) {
    console.error('User not authenticated');
    return;
  }
  const startTimeTimestamp = new Date(startTime).getTime();
  try {
    const response = await axios.post(
      'http://localhost:5001/tournaments/create', 
      {
        entryFee,
        gameType,
        maxPlayers,
        startTime: startTimeTimestamp,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Send the token here
        }
      }
    );
    console.log(response.data);
  } catch (err) {
    console.error('Error creating tournament', err); 
  };

    console.log({ entryFee, maxPlayers, startTime, gameType });
};

  return (
    <div>
      <h2>Create Tournament</h2>
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
        Game Type:
        <input 
          type="string" 
          value={"1vN"} 
          onChange={(e) => setGameType(e.target.value)} 
        />
      </label>
      <br />
      <button onClick={handleCreateTournament}>Create Tournament</button>
    </div>
  );
};

export default TournamentCreation;
