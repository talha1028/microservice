import { Module } from '@nestjs/common';
import { RedisService } from '../services/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService], // 👈 so other modules can use it
})
export class RedisModule {}
