import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbmodule } from './modules/db.module';
import { UsersModule } from './modules/users.module';
import { DataSource } from 'typeorm';
import { multerModule } from './modules/multer.module';

@Module({
  imports: [dbmodule,UsersModule,multerModule],
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
