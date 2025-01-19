import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from 'src/tournament/player.schema';
import { TournamentModule } from 'src/tournament/tournament.module';
import { TournamentSchema } from 'src/tournament/tournament.schema';
import { UserModule } from 'src/user/user.module';
import { RpcService } from './rpc.service';


@Module({
  imports: [
    MongooseModule.forFeature([
        { name: 'Tournament', schema: TournamentSchema },
        { name: 'Player', schema: PlayerSchema },
    ],),
    // forwardRef(() => TournamentModule),
    UserModule,
  ],
  providers: [RpcService],
  exports: [RpcService],
})
export class RpcModule {}
