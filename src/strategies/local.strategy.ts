import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from "@nestjs/passport";
import { Authservice } from "src/services/auth.service";

@Injectable()
export class Localstrategy extends PassportStrategy(Strategy) {
  constructor(private authservice: Authservice) {
    super({ usernameField: 'email' }); // tells passport to use "email" instead of "username"
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authservice.validateusercredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // this will be attached to req.user
  }
}
