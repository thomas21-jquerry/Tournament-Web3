import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as contractABI from '../ABI/TournamentABI.json';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from './tournament.schema';
import { Game } from './game.schema';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private abi = contractABI

  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel('Tournament') private readonly tournamentModel: Model<Tournament>,
    @InjectModel('Game') private readonly gameModel: Model<Game>,
    ) {
    this.provider = new ethers.JsonRpcProvider(this.configService.get<string>('INFURA_URL'));
    const wallet = new ethers.Wallet(this.configService.get<string>('PRIVATE_KEY'), this.provider);
    this.contract = new ethers.Contract(this.configService.get<string>('CONTRACT_ADDRESS'), this.abi, wallet);
  }

  // Function to create a tournament
  async createTournament(createTournamentDto: CreateTournamentDto):Promise<Tournament>{
    const { gameType, entryFee, maxPlayers, startTime } = createTournamentDto;
    const game = await this.gameModel.findOne({ name: gameType }).exec();
    if (!game) {
      throw new Error('Game not found');
    }
    const tournament = new this.tournamentModel({
      entryFee,
      maxPlayers,
      startTime,
      gameType,
      gameId: game._id,
    });
    // const tx = await this.contract.createTournament();
    return await tournament.save();
    // await tx.wait();
    // return 'Tournament Created';
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

  async createGame(name: string, description: string): Promise<Game> {
    const game = new this.gameModel({ name, description });
    return await game.save();
  }

  async verifyJwt(token: string): Promise<any> {
    try {
      // Verify the token using the JWT service
      const decoded = this.jwtService.verify(token);

      // If verification is successful, return the decoded token (payload)
      return decoded;
    } catch (error) {
      // If the token is invalid or expired, throw an exception
      throw new Error('Invalid or expired token');
    }
  }
}
