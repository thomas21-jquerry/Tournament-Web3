import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { BadRequestException } from '@nestjs/common';

@Injectable()
export class RpcService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

}
