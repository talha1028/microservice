import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                  type: 'postgres',
                  host: config.get<string>('DB_HOST'),
                  port: config.get<number>('DB_PORT'),
                  url: config.get<string>('DB_URL'),
                  username: config.get<string>('DB_USER'),
                  password: config.get<string>('DB_PASS'),
                  database: config.get<string>('DB_NAME'),
                  autoLoadEntities: true,
                  synchronize: true,
                };
              }
        })
    ]
})
export class dbmodule{
    
}