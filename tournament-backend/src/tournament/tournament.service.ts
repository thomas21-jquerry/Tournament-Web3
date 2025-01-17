import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as contractABI from '../ABI/TournamentABI.json';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TournamentService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private abi = contractABI

  constructor(
    private configService: ConfigService
    ) {
    this.provider = new ethers.JsonRpcProvider(this.configService.get<string>('INFURA_URL'));
    const wallet = new ethers.Wallet(this.configService.get<string>('PRIVATE_KEY'), this.provider);
    this.contract = new ethers.Contract(this.configService.get<string>('CONTRACT_ADDRESS'), this.abi, wallet);
  }

  // Function to create a tournament
  async createTournament(entryFee: number, maxPlayers: number, startTime: number) {
    const tx = await this.contract.createTournament(entryFee, maxPlayers, startTime);
    await tx.wait();
    return 'Tournament Created';
  }

  // Function for users to join a tournament
  async joinTournament(tournamentId: number, entryFee: number) {
    const tx = await this.contract.joinTournament(tournamentId, {
      value: ethers.parseEther(entryFee.toString()),
    });
    await tx.wait();
    return 'Joined Tournament';
  }

  // Submit scores
  async submitScore(tournamentId: number, score: number) {
    const tx = await this.contract.submitScore(tournamentId, score);
    await tx.wait();
    return 'Score Submitted';
  }

  // Finish the tournament
  async finishTournament(tournamentId: number) {
    const tx = await this.contract.finishTournament(tournamentId);
    await tx.wait();
    return 'Tournament Finished';
  }
}
