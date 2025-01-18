// src/auth/roles.guard.ts

import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../user/user.schema'; // Import the User schema


@Injectable()
export class RolesGuard implements CanActivate {
  constructor() {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {  // Explicitly return Promise<boolean>
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // Get the user object from the request

    if (!user) {
      return false;  // No user attached (JWT token verification failed)
    }

    const requiredRoles = this.getRequiredRoles(context);  // Get the required roles for this route

    // Check if the user has one of the required roles
    return requiredRoles.includes(user.role);
  }

  // Method to get the roles metadata set by @Roles decorator
  private getRequiredRoles(context: ExecutionContext): string[] {
    const handler = context.getHandler();
    const roles = Reflect.getMetadata('roles', handler);  // Get roles metadata
    return roles || [];
  }
}
