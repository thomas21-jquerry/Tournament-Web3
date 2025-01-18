import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from '../tournament/tournament.schema';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GameSchema } from './game.schema';
import { UserModule } from 'src/user/user.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tournament', schema: TournamentSchema },
      {name: 'Game', schema: GameSchema}
    ],),
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],  // Inject ConfigService to access env variables
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // Retrieve the secret from .env
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserModule
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}
