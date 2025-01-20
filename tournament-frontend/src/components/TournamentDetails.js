import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEthereum } from '../context/EthereumContext';
import { ethers } from 'ethers';

const TournamentDetail = () => {
  const { id } = useParams();  // Get the tournament ID from the URL
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userIsParticipant, setUserIsParticipant] = useState(false);
  const [userScore, setUserScore] = useState('');
  const [scoreboard, setScoreboard] = useState([]);
  const [user, setUser] = useState('')
  const { signer, address, contract, isAdmin } = useEthereum();

  const handleJoinTournament = async () => {
    try {
      setLoading(true);
      const tx = await contract.joinTournament(id, { value: ethers.parseUnits(tournament.entryFee, 'ether') });
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setUserIsParticipant(true);
        alert('Successfully joined the tournament!');
      } else {
        alert('Transaction failed! Please try again.');
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Cannot join the tournament.");
      setLoading(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!userScore) {
      alert('Please enter a score!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('User is not authenticated');
        setLoading(false);
        return;
      }

      // API request to submit the score
      const response = await axios.post(
        `http://localhost:5001/tournaments/submit-score`,
        {
          tournamentId: id,
          player: address,
          score: userScore,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('Score submitted successfully!');
        setUserScore(''); // Clear the input field after submission
      } else {
        alert('Failed to submit the score!');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to submit the score');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          setError('JWT token does not exist');
          return;
        }

        const response = await axios.get(`http://localhost:5001/tournaments/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const playerResponse = await axios.get(`http://localhost:5001/tournaments/user/${address}/tournament/${response.data.tournament._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        setUserIsParticipant(playerResponse.data.status);
        setTournament(response.data.tournament);  // Assuming the response contains the tournament details
        
        // Fetching scoreboard data
        const scoreboardResponse = await axios.get(`http://localhost:5001/tournaments/${response.data.tournament._id}/user/${address}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        setScoreboard(scoreboardResponse.data.players); 
        setLoading(false);
      } catch (err) {
        console.log(err)
        setError('Failed to fetch tournament details.');
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [address]);

  if (loading) {
    return <div style={styles.loading}>Loading tournament details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Tournament Details</h2>
      
      {/* Display Image from public folder */}
      <div style={styles.imageContainer}>
        <img
          src="/colosseum.jpeg"  // Image in the public folder
          alt="Tournament"
          style={styles.tournamentImage}
        />
      </div>

      {tournament && (
        <div style={styles.tournamentDetails}>
          <p><strong>Tournament ID:</strong> {tournament.onchainId}</p>
          <p><strong>Name:</strong> {tournament.name}</p>
          <p><strong>Entry Fee:</strong> {tournament.entryFee} ETH</p>
          <p><strong>Max Players:</strong> {tournament.maxPlayers}</p>
          <p><strong>Current Player Count:</strong> {tournament.curPlayers}</p>
          <p><strong>Start Time:</strong> {new Date(tournament.startTime).toLocaleString()}</p>
          <p><strong>End Time:</strong> {new Date(tournament.endTime).toLocaleString()}</p>
          <p><strong>Status:</strong> {tournament.isActive ? 'Active' : 'Finished'}</p>

          {!userIsParticipant && tournament.isActive && (
            <button style={styles.button} onClick={handleJoinTournament}>
              Join Tournament
            </button>
          )}

          {userIsParticipant && tournament.isActive && (
            <div style={styles.scoreSubmission}>
              <h3>Submit Your Score</h3>
              <input
                style={styles.input}
                type="number"
                value={userScore}
                onChange={(e) => setUserScore(e.target.value)}
                placeholder="Enter your score"
              />
              <button style={styles.button} onClick={handleSubmitScore}>
                Submit Score
              </button>
            </div>
          )}

          {userIsParticipant && !tournament.isActive && (
            <p style={styles.infoMessage}>The tournament has finished. You cannot submit scores anymore.</p>
          )}

          {/* Display Scoreboard */}
          <div style={styles.scoreboardContainer}>
            <h3>Scoreboard</h3>
            <table style={styles.scoreboardTable}>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {scoreboard.length > 0 ? (
                  scoreboard.map((player, index) => (
                    <tr key={index}>
                      {player.userId.address==address? <td>You</td>:<td>{player.userId.address}</td>}
                      <td>{player.score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No scores available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for the TournamentDetail component
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
  },
  imageContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  tournamentImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  tournamentDetails: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '10px',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'background-color 0.3s ease',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '100%',
    fontSize: '1rem',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  scoreSubmission: {
    marginTop: '20px',
    textAlign: 'center',
  },
  infoMessage: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#007bff',
  },
  scoreboardContainer: {
    marginTop: '30px',
  },
  scoreboardTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
//   scoreboardTable th: {
//     padding: '10px',
//     backgroundColor: '#f2f2f2',
//   },
//   scoreboardTable td: {
//     padding: '10px',
//   }
};

export default TournamentDetail;
