import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule,ConfigService } from "@nestjs/config";
import { Authservice } from "src/services/auth.service";
import { JwtStrategy } from "src/strategies/jwt.strategy";
import { UsersModule } from "./users.module";
import { RedisService } from "src/services/redis.service";
import { Authcontroller } from "src/controllers/auth.controller";
import { PassportModule } from "@nestjs/passport";
import { Localstrategy } from "src/strategies/local.strategy";
@Module({
        imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: config.get<string>('JWT_EXPIRES') }
            })
        })
    ],
    controllers: [Authcontroller],
    providers: [Authservice, JwtStrategy, RedisService, Localstrategy], // <-- add here
    exports: [Authservice]
})
export class Authmodule {}