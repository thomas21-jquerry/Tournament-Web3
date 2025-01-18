// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';  // JWT Payload interface

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,  // Secret for JWT verification
    });
  }

  async validate(payload: JwtPayload) {
    return payload;  // Return the payload (which includes the address and role)
  }
}
