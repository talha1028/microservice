import { createClient, RedisClientType } from "redis";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient();
    this.client.on("error", (err) => console.log("Redis error", err));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.set(key, serialized, { EX: ttl });
    } else {
      await this.client.set(key, serialized);
    }
  }

  // ✅ New method: get cached value
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // ✅ New method: check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // ✅ New method: delete key
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
