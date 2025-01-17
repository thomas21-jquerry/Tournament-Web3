import { Controller, Post, Body } from '@nestjs/common';
import { TournamentService } from './tournament.service';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('create')
  async createTournament(@Body() body: { entryFee: number, maxPlayers: number, startTime: number }) {
    return this.tournamentService.createTournament(body.entryFee, body.maxPlayers, body.startTime);
  }

//   @Post('join')
//   async joinTournament(@Body() body: { tournamentId: number, entryFee: number }) {
//     return this.tournamentService.joinTournament(body.tournamentId, body.entryFee);
//   }

  @Post('submit-score')
  async submitScore(@Body() body: { tournamentId: number, score: number }) {
    return this.tournamentService.submitScore(body.tournamentId, body.score);
  }

  @Post('finish')
  async finishTournament(@Body() body: { tournamentId: number }) {
    return this.tournamentService.finishTournament(body.tournamentId);
  }
}
