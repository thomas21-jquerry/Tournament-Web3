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
        console.log(response.data.tournament)
        const userIsInTournament = response.data.tournament.users.some(user => user.address === address);
        setUserIsParticipant(userIsInTournament);
        setTournament(response.data.tournament);  // Assuming the response contains the tournament details
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tournament details.');
        setLoading(false);
      }
    };

    fetchTournamentDetails();
  }, [id]);  // Re-run the effect when the tournament ID changes

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
          <p><strong>Entry Fee:</strong> {tournament.entryFee} ETH</p>
          <p><strong>Max Players:</strong> {tournament.maxPlayers}</p>
          <p><strong>Current Player Count:</strong> {tournament.curPlayers}</p>
          <p><strong>Start Time:</strong> {new Date(tournament.startTime).toLocaleString()}</p>
          <p><strong>Status:</strong> {tournament.isActive ? 'Active' : 'Finished'}</p>
          {!userIsParticipant && tournament.isActive && (
            <button onClick={handleJoinTournament}>Join Tournament</button>
          )}

          {userIsParticipant && <p>You are already a participant in this tournament.</p>}
        </div>
      )}
    </div>
  );
};

export default TournamentDetail;
