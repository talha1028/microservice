import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from "@nestjs/passport";
import { Authservice } from "src/services/auth.service";

@Injectable()
export class Localstrategy extends PassportStrategy(Strategy){
    constructor(private authservice: Authservice) {
        super({usernameField: 'email'})
    }
    async validate(email: string, password: string):Promise <any>{
        const user = this.authservice.validateusercredentials(email,password);
        if(!user){
            throw new UnauthorizedException;
        }
        return user;
    }
    
}