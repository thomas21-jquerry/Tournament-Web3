import { Controller, Post, Body, UseGuards, Get, HttpStatus, Res, Param } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentService } from './tournament.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Response } from 'express'; // Import the correct Response type

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard) // Use both JwtAuthGuard and RolesGuard
  @Roles('admin') // Ensure only 'admin' users can create a tournament
  async createTournament(
    @Body() createTournamentDto: CreateTournamentDto, 
    @Res() res: Response
  ) {
    try {
      const resp = await this.tournamentService.createTournament(createTournamentDto); // Await the result
      res.status(HttpStatus.CREATED).json(resp); // Return the response with a 201 status code
    } catch (err) {
      console.error(err); // Log the error
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error creating tournament', error: err.message });
    }
  }

  @Get('user/:userAdd/tournament/:tournamentId')
  @UseGuards(JwtAuthGuard, RolesGuard) // Use both JwtAuthGuard and RolesGuard
  @Roles('user', 'admin') // Ensure only 'user' roles can access this endpoint
  async getScore(
    @Res() res: Response,
    @Param('userAdd') userAdd: string,
    @Param('tournamentId') tournamentId: string,
    ) {
    try{
      const resp = await this.tournamentService.getScore(tournamentId, userAdd);
      res.status(HttpStatus.OK).json(resp);
    }catch(err){
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error getting tournaments', error: err.message });
    }
  }

  @Post('submit-score')
  async submitScore(
    @Res() res: Response,
    @Body() body: { tournamentId: number, player: string, score: number }) {
    try{
      const resp = this.tournamentService.submitScore(body.tournamentId, body.player, body.score);
      res.status(HttpStatus.OK).json(resp)
    }catch(err){
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error submitting score', error: err.message });
    }
  }

  @Post('finish')
  async finishTournament(@Body() body: { tournamentId: number }) {
    return this.tournamentService.finishTournament(body.tournamentId);
  }

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard) // Use both JwtAuthGuard and RolesGuard
  @Roles('user') // Ensure only 'user' roles can access this endpoint
  async getTournaments(@Res() res: Response) {
    try{
      const resp = await this.tournamentService.getTournaments();
      res.status(HttpStatus.OK).json(resp);
    }catch(err){
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error getting tournaments', error: err.message });
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Use both JwtAuthGuard and RolesGuard
  @Roles('user', 'admin') // Ensure only 'user' roles can access this endpoint
  async getTournament(
    @Res() res: Response,
    @Param('id') id: Number
    ) {
    try{
      const resp = await this.tournamentService.getTournament(id);
      res.status(HttpStatus.OK).json(resp);
    }catch(err){
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error getting tournament', error: err.message });
    }
  }
}
