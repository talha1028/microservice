import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/entities/user.entity";
import { RedisService } from "./redis.service";
@Injectable()
export class Authservice{
    constructor(
        private userservice: UsersService,
        private jwtservice: JwtService,
        private redisservice: RedisService    
    ) {}
    
    async login(user : User){
        const payload = { id : user.id, email: user.email, role: user.role}
        return{
            accessToken : await this.jwtservice.signAsync(payload)
        }
    }
    async validateusercredentials(email: string , password: string){
        const user = await this.userservice.getuserbyemail(email)
        if (user && user.password === password){
            const {password,...result} = user;
            this.redisservice.set(`session:${user.id}`,{email: user.email},600)
            // console.log(this.redisservice.get)
            return result;
        }
        return null;
    }
    async findbyemail(email: string){
        return this.userservice.getuserbyemail(email);
    }
}