import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbmodule } from './modules/db.module';
import { UsersModule } from './modules/users.module';
import { DataSource } from 'typeorm';
import { multerModule } from './modules/multer.module';
import { Authmodule } from './modules/auth.module';

@Module({
  imports: [dbmodule,UsersModule,multerModule,Authmodule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor (datasource: DataSource){
    if(datasource.isInitialized){
      console.log('Db connected');
    }
    else{
      console.log('error while connecting to db')
    }
  }
}
