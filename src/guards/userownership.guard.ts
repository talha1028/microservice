import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity'
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const paramId = Number(request.params.id);
    console.log(user);
    if(!paramId){
        throw new BadRequestException('User id not found in params')
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) {
      return true;
    }
    if (user.userId === paramId) {
      return true;
    }
    throw new ForbiddenException('You are not allowed to access this resource');
  }
}
