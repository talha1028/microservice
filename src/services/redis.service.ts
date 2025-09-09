import { createClient, RedisClientType } from "redis";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
@Injectable()
export class Redisservice implements OnModuleDestroy, OnModuleInit {
    private client: RedisClientType
    async onModuleInit() {
        this.client = createClient();
        this.client.on('error', err => (console.log('redis error')));
        await this.client.connect();
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async set(key: string,value: any,ttl: number):Promise<void>{
        const serialised = JSON.stringify(value);
        if(ttl){
            await this.client.set(key,serialised,{EX : ttl})
        }
        else{
            await this.client.set(key,serialised)
        }
    }
}