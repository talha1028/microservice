import { Authservice } from "src/services/auth.service";
import { Controller, Request, UseGuards } from "@nestjs/common";
import { Body,Post,Patch,Get,Delete } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Jwtauthguard } from "src/guards/jwtauth.guard";
@Controller('auth')
export class Authcontroller{
    constructor(private authservice: Authservice) {}
    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Post()
    login(@Request() req){
        return this.authservice.login(req.user)
    }
    
}