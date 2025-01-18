// src/auth/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // Import the user service

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private userService: UserService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader) {
      return false;  // No token provided
    }

    try {
      const token = authorizationHeader.split(' ')[1];  // Extract token from "Bearer <token>"
      const decoded = this.jwtService.verify(token);  // Verify the token
      // Attach the decoded address to the request object
      const user = await this.userService.getUserByAddress(decoded.address);
      if (!user) {
        return false;  // If user not found in DB, deny access
      }

      request.user = user;  // Attach user data (including role) to the request
      return true;  // Token is valid and user found
    } catch (error) {
      return false;  // Invalid token or error
    }
  }
}
