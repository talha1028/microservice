import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/admin.service';
import { User } from '../entities/user.entity';
import { UsersService } from 'src/services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // allow repo injection
  controllers: [AdminController],
  providers: [AdminService,UsersService],
  exports: [AdminService], // if needed by other modules
})
export class AdminModule {}
