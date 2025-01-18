import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator'; 

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)  // Use both JwtAuthGuard and RolesGuard
  @Roles('admin')
  async createTournament(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.createTournament(createTournamentDto);
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
