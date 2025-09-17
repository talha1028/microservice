import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Get all admins
  async findAllAdmins(): Promise<User[]> {
    return this.userRepo.find({ where: { role: UserRole.ADMIN } });
  }

  // Promote user to admin
  async promoteUserToAdmin(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    if (user.role === UserRole.ADMIN){
        throw new BadRequestException('User already admin');
    }
    user.role = UserRole.ADMIN;
    return this.userRepo.save(user);
  }

  // Demote admin to normal user
  async demoteAdmin(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    if (user.role !== UserRole.ADMIN) {
      throw new NotFoundException(`User ${userId} is not an admin`);
    }

    user.role = UserRole.USER;
    return this.userRepo.save(user);
  }
}
