import { IsString, IsNumber, IsDate } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  name: string;

  @IsString()
  entryFee: string;

  @IsNumber()
  maxPlayers: number;

  @IsDate()
  startTime: Date;

  @IsString()
  gameType: string;

}
