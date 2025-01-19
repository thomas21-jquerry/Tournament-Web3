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
    const [userScore, setUserScore] = useState('');  // State to store score input
    const { signer, address, contract, isAdmin } = useEthereum();

  const handleJoinTournament = async()=>{
    try{
        setLoading(true);
        const tx = await contract.joinTournament(id, { value: ethers.parseUnits(tournament.entryFee, 'ether') });
        const receipt = await tx.wait();
        if (receipt.status === 1) {
            setUserIsParticipant(true);
            alert('Successfully joined the tournament!');
          } else {
            alert('Transaction failed! Please try again.');
        }
        setLoading(false)
    }catch(err){
        console.log(err)
        setError("cannot join the tournament");
        setLoading(false)
    }
  }

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
          { tournamentId: id,
            player: address,
            score: userScore },
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
          console.error('User not authenticated');
          setError('jwt token does not exist');
          return;
        }

        const response = await axios.get(`http://localhost:5001/tournaments/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log(`http://localhost:5001/tournaments/user/${address}/tournament/${response.data.tournament._id}`, "here")
        const playerResponse = await axios.get(`http://localhost:5001/tournaments/user/${address}/tournament/${response.data.tournament._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        // const userIsInTournament = response.data.tournament.users.some(user => user.address === address);
        setUserIsParticipant(playerResponse.data.status);
        setTournament(response.data.tournament);  // Assuming the response contains the tournament details
        setLoading(false);
      } catch (err) {
        // setError('Failed to fetch tournament details.');
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [signer]);  // Re-run the effect when the tournament ID changes

  if (loading) {
    return <div>Loading tournament details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>Tournament Details</h2>
      {tournament && (
        <div>
          <p><strong>Tournament ID:</strong> {tournament.onchainId}</p>
          <p><strong>Name:</strong> {tournament.name}</p>
          <p><strong>Entry Fee:</strong> {tournament.entryFee} ETH</p>
          <p><strong>Max Players:</strong> {tournament.maxPlayers}</p>
          <p><strong>Current Player Count:</strong> {tournament.curPlayers}</p>
          <p><strong>Start Time:</strong> {new Date(tournament.startTime).toLocaleString()}</p>
          <p><strong>Status:</strong> {tournament.isActive ? 'Active' : 'Finished'}</p>
          {!userIsParticipant && tournament.isActive && (
            <button onClick={handleJoinTournament}>Join Tournament</button>
          )}

          {userIsParticipant && tournament.isActive && (
            <div>
              <h3>Submit Your Score</h3>
              <input
                type="number"
                value={userScore}
                onChange={(e) => setUserScore(e.target.value)}
                placeholder="Enter your score"
              />
              <button onClick={handleSubmitScore}>Submit Score</button>
            </div>
          )}

          {userIsParticipant && !tournament.isActive && (
            <p>The tournament has finished. You cannot submit scores anymore.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
