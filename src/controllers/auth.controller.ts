import { Controller, Request, UseGuards, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Authservice } from 'src/services/auth.service';
import { LocalAuthGuard } from 'src/guards/locatauth.guard';

@ApiTags('Auth')
@Controller('auth')
export class Authcontroller {
  constructor(private authservice: Authservice) {}


@UseGuards(LocalAuthGuard)
@Post('login')
@ApiOperation({ summary: 'User login' })
@ApiResponse({ status: 201, description: 'JWT token returned' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      email: { type: 'string', example: 'test@example.com' },
      password: { type: 'string', example: '123456' },
    },
  },
})
login(@Request() req) {
  return this.authservice.login(req.user);
}

}
