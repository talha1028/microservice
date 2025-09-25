import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createuserdto } from '../dtos/user.dto';
import { updateuserdto } from '../dtos/updateuser.dto';
import { join } from 'path';
import { promises as fs } from 'fs';
import { RedisService } from '../services/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  // ✅ Get all users (with caching)
  async getusers() {
    const cacheKey = 'users:all';
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      console.log('✅ Cache HIT → users:all from Redis');
      return cached;
    }

    console.log('❌ Cache MISS → users:all fetched from DB');
    const users = await this.userRepo.find();
    await this.redisService.set(cacheKey, users, 300);
    return users;
  }

  // ✅ Get user by ID (with caching)
  async getuser(id: number) {
    const cacheKey = `user:${id}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT → ${cacheKey} from Redis`);
      return cached;
    }

    console.log(`❌ Cache MISS → ${cacheKey} fetched from DB`);
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    await this.redisService.set(cacheKey, user, 600);
    return user;
  }

  async getuserbyemail(email: string) {
    console.log(`ℹ️ Fetching user by email (${email}) directly from DB`);
    return this.userRepo.findOneBy({ email });
  }

  // ✅ Create user (with duplicate checks + DB error catch)
  async creatuser(userdto: createuserdto) {
  try {
    // manual check for duplicates
    const existing = await this.userRepo.findOne({
      where: [{ email: userdto.email }, { name: userdto.name }],
    });

    if (existing) {
      if (existing.email === userdto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existing.name === userdto.name) {
        throw new ConflictException('Name already exists');
      }
    }

    const user = this.userRepo.create(userdto);
    const saved = await this.userRepo.save(user);

    console.log(`🆕 User created → cached at user:${saved.id}`);
    await this.redisService.set(`user:${saved.id}`, saved, 600);
    await this.redisService.del('users:all'); // invalidate list

    return saved;
  } catch (error) {
    // ✅ Let NestJS exceptions pass through untouched
    if (error instanceof ConflictException) {
      throw error;
    }

    // ✅ Postgres unique constraint violation
    if (error.code === '23505') {
      throw new ConflictException('Email or name already exists');
    }

    // ❌ Unexpected errors → return 500
    throw new InternalServerErrorException(error.message);
  }
}


  // ✅ Delete user (with checks)
  async deleteuser(id: number, currentUserId: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.SUPERADMIN && user.id === currentUserId) {
      throw new BadRequestException('Superadmin cannot delete themselves');
    }

    await this.userRepo.remove(user);

    console.log(
      `🗑️ User ${id} deleted → cache invalidated (user:${id}, users:all)`,
    );
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all');

    return { message: 'User deleted successfully' };
  }

  // ✅ Update user (with duplicate email/name check)
  async updateuser(id: number, updateuserDto: updateuserdto) {
    try {
      const existingUser = await this.userRepo.findOne({
        where: [
          { email: updateuserDto.email },
          { name: updateuserDto.name },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        if (
          updateuserDto.email &&
          existingUser.email === updateuserDto.email
        ) {
          throw new ConflictException('Email already in use');
        }
        if (
          updateuserDto.name &&
          existingUser.name === updateuserDto.name
        ) {
          throw new ConflictException('name already in use');
        }
      }

      await this.userRepo.update(id, updateuserDto);
      const updated = await this.userRepo.findOneBy({ id });

      if (!updated) {
        throw new NotFoundException('User not found');
      }

      console.log(`♻️ User ${id} updated → cache refreshed`);
      await this.redisService.set(`user:${id}`, updated, 600);
      await this.redisService.del('users:all');

      return updated;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email or name already exists');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  // ✅ Upload avatar
  async uploadavatar(id: number, file: Express.Multer.File) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    if (user.avatarurl) {
      const oldFilePath = join(__dirname, '..', user.avatarurl);
      try {
        await fs.unlink(oldFilePath);
      } catch {
        console.warn('⚠️ Old avatar not found, skipping deletion');
      }
    }

    user.avatarurl = `/uploads/avatars/${file.filename}`;
    await this.userRepo.save(user);

    console.log(`🖼️ Avatar updated for user ${id} → cache refreshed`);
    await this.redisService.set(`user:${id}`, user, 600);
    await this.redisService.del('users:all');

    return {
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatarurl,
    };
  }

  // ✅ Get avatar URL
  async getavatarurl(id: number) {
    const user = await this.getuser(id);
    if (!user.avatarurl) {
      throw new NotFoundException('User has no uploaded avatar');
    }
    return user.avatarurl;
  }
}
