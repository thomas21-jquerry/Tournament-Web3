import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TournamentModule } from './tournament/tournament.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), // to load environment variables
    MongooseModule.forRoot(
      process.env.MONGO_URI,  // Use .env or fallback to default
    ),
    UserModule,
    TournamentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
