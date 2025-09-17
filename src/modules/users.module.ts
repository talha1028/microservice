import { Module, UseGuards } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from 'src/controllers/users.controller';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/services/users.service';
import { multerModule } from './multer.module';
import { Emailmodule } from './email.module';
import { UserResolver } from 'src/resolvers/user.resolver';
import { SeedService } from 'src/services/seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        multerModule,
        Emailmodule
    ],
    controllers: [UsersController],
    providers: [UsersService,UserResolver,SeedService],
    exports: [UsersService,SeedService]
})
export class UsersModule {}
