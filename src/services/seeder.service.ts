import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const existing = await this.userRepo.findOne({
      where: { role: UserRole.SUPERADMIN },
    });

    if (!existing) {
      const superAdmin = this.userRepo.create({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: '12345678', // 👈 plain string password
        role: UserRole.SUPERADMIN,
      });

      await this.userRepo.save(superAdmin);
      console.log('✅ Super Admin user seeded');
    } else {
      console.log('ℹ️ Super Admin already exists');
    }
  }
}
