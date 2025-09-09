import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule,ConfigService } from "@nestjs/config";
import { Authservice } from "src/services/auth.service";
import { JwtStrategy } from "src/strategies/jwt.strategy";
@Module({
    imports:[
        
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config : ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions:{ expiresIn:config.get<string>('JWT_EXPIRES')}
            })
        })
    ],
    providers: [Authservice,JwtStrategy],
    exports:[Authservice]
    

})
export class Authmodule {}