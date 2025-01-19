import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import { Player } from 'src/tournament/player.schema';
import { Tournament } from 'src/tournament/tournament.schema';
import { UserService } from 'src/user/user.service';
import * as contractABI from '../ABI/TournamentABI.json';

@Injectable()
export class RpcService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private abi = contractABI;

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        @InjectModel('Tournament') private readonly tournamentModel: Model<Tournament>,
        @InjectModel("Player") private readonly playerModel: Model<Player>,
    ) {
        this.provider = new ethers.JsonRpcProvider(this.configService.get<string>('INFURA_URL'));
        const wallet = new ethers.Wallet(this.configService.get<string>('PRIVATE_KEY'), this.provider);
        this.contract = new ethers.Contract(this.configService.get<string>('CONTRACT_ADDRESS'), this.abi, wallet);
    }

    async onModuleInit() {
        this.listenToJoinTournamentEvent();
        this.listenToBadgeMintedEvent();
    }

    async createTournament(entryFee: string, maxPlayer: number, startTime: number) {
        try {
            const entryFeeInWei = ethers.parseUnits(entryFee, 18);
            const tx = await this.contract.createTournament(entryFeeInWei, maxPlayer, startTime);
            const receipt = await tx.wait();
            let onChainTournamentId: number;

            receipt.logs.forEach(log => {
                try {
                    const parsedLog = this.contract.interface.parseLog(log);

                    if (parsedLog.name === 'TournamentCreated') {
                        const { tournamentId, creator } = parsedLog.args;
                        onChainTournamentId = tournamentId;
                        console.log(`Tournament Created - ID: ${tournamentId.toString()}, Creator: ${creator}`);
                    }
                } catch (error) {
                    console.error('Error parsing log:', error);
                }
            });
            return parseInt(onChainTournamentId.toString(), 10);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async submitScore(tournamentId, player, score){
        try{
            console.log("started submit score transaction..")
            const tx = await this.contract.submitScore(tournamentId, player, score);
            const receipt = await tx.wait();
            console.log("submit score transaction done")
            if (receipt.status === 1) {
                return true
            }
            else{
                throw new Error("Transaction failed")
            }
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async getTournamentCount() {
        try {
            const count = await this.contract.tournamentCount();
            return count;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async endTournament(tournamentId: number) {
        try{
            const tx = await this.contract.finishTournament(tournamentId);
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                return true
            }
            else{
                throw new Error(`Transaction failed to end tournament with onchian id:${tournamentId}` )
            }
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    async onModuleDestroy() {
        // Clean up when module is destroyed (unsubscribe)
        if (this.contract) {
            this.contract.removeAllListeners('PlayerJoined');
            this.contract.removeAllListeners('BadgeMinted');
        }
    }

    private listenToJoinTournamentEvent() {
        this.contract.on('PlayerJoined', (tournamentId, user: string) => {
            console.log(`User ${user} joined tournament ${tournamentId.toString()}`);
            const tournamentIdInt = parseInt(tournamentId.toString(), 10);
            this.handleJoinTournamentEvent(tournamentIdInt, user);
        });
    }

    private listenToBadgeMintedEvent() {
        this.contract.on('BadgeMinted', (player: string, badgeId) => {
            console.log(`Player ${player} minted badge with ID ${badgeId.toString()}`);
            const badgeIdInt = parseInt(badgeId.toString(), 10);
            this.handleBadgeMintedEvent(player, badgeIdInt);
        });
    }

    async handleJoinTournamentEvent(tournamentId: number, address: string) {
        try {
            const user = await this.userService.getUserByAddress(address);
            if (!user) {
                throw new Error(`User with address ${address} not found`);
            }
            const tournament = await this.tournamentModel.findOneAndUpdate(
                { onchainId: tournamentId, isActive: true },
                {
                    $push: { users: user._id },  
                    $inc: { curPlayers: 1 },    
                },
                { new: true }  
            ).exec();

            const player = new this.playerModel({
                tournamentId: tournament._id,
                userId: user._id,
                score: 0,
            });
            await player.save();
            return tournament;
        } catch (err) {
            throw err;
        }
    }

    private async handleBadgeMintedEvent(player: string, badgeId: number) {
        await this.userService.handleNewUserBadgeMint(player, badgeId);
    }
}
