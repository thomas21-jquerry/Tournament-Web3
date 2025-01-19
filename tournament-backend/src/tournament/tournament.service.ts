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
import { RpcService } from '../rpc/rpc.service';
import { Player } from './player.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TournamentService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private abi = contractABI

  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly rpcService: RpcService,
    private readonly userService: UserService,
    @InjectModel('Tournament') private readonly tournamentModel: Model<Tournament>,
    @InjectModel('Game') private readonly gameModel: Model<Game>,
    @InjectModel('Score') private readonly playerModel: Model<Player>,
    ) {
  }

  // Function to create a tournament
  async createTournament(createTournamentDto: CreateTournamentDto){
    const { name, gameType, entryFee, maxPlayers, startTime } = createTournamentDto;
    let startTimeTimestamp =  Math.floor(Number(startTime)/1000);
    const game = await this.gameModel.findOne({ name: gameType }).exec();
    if (!game) {
      throw new Error('Game not found');
    }


    const tournamentId = await this.rpcService.createTournament(entryFee, maxPlayers, startTimeTimestamp)
    const tournament = new this.tournamentModel({
      name,
      entryFee,
      onchainId: tournamentId,
      maxPlayers,
      startTime: startTimeTimestamp,
      gameType,
      gameId: game._id,
    });
    return await tournament.save();
  }

  async getTournaments(){
    try{
      const tournaments = await this.tournamentModel.find({}).exec();
      return {status: true,tournaments};
    }catch(error){
      console.log(error);
      throw error
    }
  }

  async getTournament(id){
    try{
      const tournament = await this.tournamentModel.findOne({onchainId: id}).exec();
      return {status: true,tournament};
    }catch(error){
      console.log(error);
      throw error
    }
  }
  

  async getScore(tournamentId: Number, address: string ){
    try{
      const user = await this.userService.getUserByAddress(address)
      if(!user || !tournamentId){
        throw new Error("address or tournamentId missing")
      }
      const score = await this.playerModel.findOne({tournamentId, userId: user._id}).exec();
      if(score === null){
        return {
          status: false,
          score: null
        }
      }
      return {
        status: true,
        score
    }

    }catch(error){
      console.log(error);
      throw error
    }
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

  async handleJoinTournament(tournamentId: number, address: string){
    try{
      const user = await this.userService.getUserByAddress(address);
      const tournament = await this.tournamentModel.findOneAndUpdate(
        { onchainId: tournamentId, isActive: true },
        {
          $push: { users: user._id },  
          $inc: { curPlayers: 1 },    
        },
        { new: true }  
      ).exec();
      return tournament;
    }catch(err){
      throw err
    }
  }
}
