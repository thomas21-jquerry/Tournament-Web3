import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as contractABI from '../ABI/TournamentABI.json';

@Injectable()
export class RpcService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private abi = contractABI
    constructor(
        private readonly configService: ConfigService,
    ) {
    this.provider = new ethers.JsonRpcProvider(this.configService.get<string>('INFURA_URL'));
    const wallet = new ethers.Wallet(this.configService.get<string>('PRIVATE_KEY'), this.provider);
    this.contract = new ethers.Contract(this.configService.get<string>('CONTRACT_ADDRESS'), this.abi, wallet);
    }

    async createTournament(entryFee: string, maxPlayer: number, startTime: number){
        try{
            const entryFeeInWei = ethers.parseUnits(entryFee, 18);
            const tx = await this.contract.createTournament(entryFeeInWei, maxPlayer, startTime)
            const receipt = await tx.wait();
            let onChainTournamentId: number;
            receipt.logs.forEach(log => {
                try {
                  // Parse the log with the contract ABI
                  const parsedLog = this.contract.interface.parseLog(log);
              
                  // If the log corresponds to the TournamentCreated event
                  if (parsedLog.name === 'TournamentCreated') {
                    const { tournamentId, creator } = parsedLog.args;
                    onChainTournamentId = tournamentId;
                    console.log(`Tournament Created - ID: ${tournamentId.toString()}, Creator: ${creator}`);
                  }
                } catch (error) {
                  // If the log doesn't correspond to the expected event, we catch the error
                  console.error('Error parsing log:', error);
                }
              });
            return parseInt(onChainTournamentId.toString(), 10)
        }catch(error){
            console.log(error)
            throw error;
        }
    }

    async getTournamentCount(){
        try{
            const count = await this.contract.tournamentCount();
            return count;
        }catch(err){
            console.log(err);
            throw err;
        }
    }


}
