import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createuserdto } from '../dtos/user.dto';
import { updateuserdto } from '../dtos/updateuser.dto';
import { NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ) { }
    async getusers() {
        return this.userRepo.find();
    }
    async getuser(id: number) {
        return this.userRepo.findOneBy({ id: id })
    }
    async getuserbyemail(email: string){
        return this.userRepo.findOneBy({email: email})
    }
    async creatuser(userdto: createuserdto) {
        const user = this.userRepo.create(userdto);
        return this.userRepo.save(user);
    }
    async deleteuser(id: number) {
        return this.userRepo.delete(id);
    }
    async updateuser(id: number, updateuserDto: updateuserdto) {
        return this.userRepo.update(id, updateuserDto);
    }
    async uploadavatar(id: number, file: Express.Multer.File) {
        const user = await this.userRepo.findOneBy({ id: id });
        if (!user) throw new NotFoundException('User not found');
        if (user.avatarurl) {
            const oldFilePath = join(__dirname, '..', user.avatarurl);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.warn('Old avatar not found, skipping deletion');
            }
        }
        // 3. Save new avatar URL
        user.avatarurl = `/uploads/${file.filename}`;
        await this.userRepo.save(user);

        // 4. Return updated user or just avatar URL
        return {
            message: 'Avatar uploaded successfully',
            avatarUrl: user.avatarurl,
        };
    }
}
