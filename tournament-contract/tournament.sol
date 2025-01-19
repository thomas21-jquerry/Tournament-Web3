// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Tournament is ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    struct TournamentDetails {
        address creator;
        uint256 entryFee;
        uint256 maxPlayers;
        uint256 startTime;
        uint256 playerCount;
        bool isActive;
    }

    struct Player {
        address playerAddress;
        uint256 tournamentId;
        uint256 score;
    }

    mapping(uint256 => TournamentDetails) public tournaments;
    mapping(address => uint256[]) public userTournaments;
    mapping(uint256 => Player[]) public tournamentPlayers;
    mapping(address => bool) public hasReceivedBadge; // Track if a player has received a badge

    uint256 public tournamentCount = 0;
    uint256 public playerBadgeCount = 0;

    event TournamentCreated(uint256 tournamentId, address creator);
    event PlayerJoined(uint256 tournamentId, address player);
    event TournamentFinished(uint256 tournamentId);
    event BadgeMinted(address player, uint256 badgeId);

    constructor() ERC721("PlayerBadge", "PB") Ownable(msg.sender) {}

    // Create a new tournament
    function createTournament(uint256 _entryFee, uint256 _maxPlayers, uint256 _startTime) external onlyOwner {
        tournamentCount = tournamentCount.add(1);
        tournaments[tournamentCount] = TournamentDetails({
            creator: msg.sender,
            entryFee: _entryFee,
            maxPlayers: _maxPlayers,
            startTime: _startTime,
            playerCount: 0,
            isActive: true
        });

        emit TournamentCreated(tournamentCount, msg.sender);
    }

    // Join a tournament
    function joinTournament(uint256 _tournamentId) external payable {
        TournamentDetails storage tournament = tournaments[_tournamentId];
        
        require(tournament.isActive, "Tournament is not active");
        require(msg.value == tournament.entryFee, "Incorrect entry fee");
        require(tournament.playerCount < tournament.maxPlayers, "Tournament is full");

        tournamentPlayers[_tournamentId].push(Player({
            playerAddress: msg.sender,
            tournamentId: _tournamentId,
            score: 0
        }));

        tournament.playerCount = tournament.playerCount.add(1);
        userTournaments[msg.sender].push(_tournamentId);

        emit PlayerJoined(_tournamentId, msg.sender);
    }

    // Award NFT badges to players who join, but only once
    function mintBadge() external {
        require(!hasReceivedBadge[msg.sender], "Player already received a badge");

        _mint(msg.sender, playerBadgeCount);
        playerBadgeCount = playerBadgeCount.add(1);

        // Mark the player as having received a badge
        hasReceivedBadge[msg.sender] = true;

        emit BadgeMinted(msg.sender, playerBadgeCount - 1); // Emit an event with the minted badge ID
    }

    // Submit scores for the players in a tournament
    function submitScore(uint256 _tournamentId, address player, uint256 _score) external onlyOwner {
        for (uint256 i = 0; i < tournamentPlayers[_tournamentId].length; i++) {
            if (tournamentPlayers[_tournamentId][i].playerAddress == player) {
                tournamentPlayers[_tournamentId][i].score = _score;
                return;
            }
        }
        revert("Player not found");
    }

    // Finish a tournament, calculate winners, and distribute rewards
    function finishTournament(uint256 _tournamentId) external onlyOwner {
        TournamentDetails storage tournament = tournaments[_tournamentId];

        require(tournament.isActive, "Tournament already finished");
        tournament.isActive = false;

        Player[] memory players = tournamentPlayers[_tournamentId];
        uint256 totalPrizePool = tournament.entryFee.mul(players.length);

        uint256 firstPlacePrize = totalPrizePool.mul(50).div(100);
        uint256 secondPlacePrize = totalPrizePool.mul(30).div(100);
        uint256 thirdPlacePrize = totalPrizePool.mul(20).div(100);

        // Sort players by score in descending order
        for (uint256 i = 0; i < players.length - 1; i++) {
            for (uint256 j = i + 1; j < players.length; j++) {
                if (players[i].score < players[j].score) {
                    Player memory temp = players[i];
                    players[i] = players[j];
                    players[j] = temp;
                }
            }
        }

        // Distribute the prizes
        payable(players[0].playerAddress).transfer(firstPlacePrize);
        payable(players[1].playerAddress).transfer(secondPlacePrize);
        payable(players[2].playerAddress).transfer(thirdPlacePrize);

        emit TournamentFinished(_tournamentId);
    }
}
