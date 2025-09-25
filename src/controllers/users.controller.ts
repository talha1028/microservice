import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { updateuserdto } from 'src/dtos/updateuser.dto';
import { createuserdto } from 'src/dtos/user.dto';
import { UsersService } from 'src/services/users.service';
import { EmailService } from 'src/services/email.service';
import { Jwtauthguard } from 'src/guards/jwtauth.guard';
import { OwnershipGuard } from '../guards/userownership.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private userservice: UsersService,
    private emailservice: EmailService,
  ) {}

  // 🚨 PUBLIC route
  @Post('createuser')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a user in database' })
  @ApiBody({ type: createuserdto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createuser(@Body() userdto: createuserdto) {
    try {
      const user = await this.userservice.creatuser(userdto);
      await this.emailservice.sendWelcomeEmail(user.email, user.id);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      };
    } catch (err) {
      if (err.code === '23505') {
        // Postgres duplicate key
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          errorCode: 'USER_EMAIL_ALREADY_EXISTS',
          message: 'A user with this email or username already exists',
        });
      }
      throw err;
    }
  }

  // ✅ ADMIN / SUPERADMIN only
  @UseGuards(Jwtauthguard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth('access-token')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (admin/superadmin only)' })
  async getusers() {
    const users = await this.userservice.getusers();
    return {
      statusCode: HttpStatus.OK,
      message: 'Users fetched successfully',
      data: users,
    };
  }

  @UseGuards(Jwtauthguard, OwnershipGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID (owner or admin)' })
  @ApiParam({ name: 'id', type: Number })
  async getuserbyid(@Param('id') id: string) {
    const user = await this.userservice.getuser(Number(id));
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: user,
    };
  }

  @UseGuards(Jwtauthguard, OwnershipGuard)
  @ApiBearerAuth('access-token')
  @Patch('updateuser/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID (owner or admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: updateuserdto,
  ) {
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: 'EMPTY_UPDATE_BODY',
        message: 'Update body cannot be empty',
      });
    }

    const updatedUser = await this.userservice.updateuser(
      Number(id),
      updateUserDto,
    );

    if (!updatedUser) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  // users.controller.ts
  @UseGuards(Jwtauthguard, OwnershipGuard)
  @ApiBearerAuth('access-token')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID (owner or admin)' })
  async deleteuser(@Param('id') id: string, @Req() req) {
    const currentUserId = req.user.id; // comes from JWT payload
    const result = await this.userservice.deleteuser(
      Number(id),
      currentUserId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  @UseGuards(Jwtauthguard, OwnershipGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload avatar for user (owner or admin)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarPath = await this.userservice.uploadavatar(Number(id), file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Avatar uploaded successfully',
      avatarUrl: `http://localhost:3335${avatarPath.avatarUrl}`,
    };
  }

  @UseGuards(Jwtauthguard, OwnershipGuard)
  @ApiBearerAuth('access-token')
  @Get(':id/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user avatar (returns URL in JSON)' })
  async getAvatar(@Param('id') id: string) {
    const avatarurl = await this.userservice.getavatarurl(Number(id));
    if (!avatarurl) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'AVATAR_NOT_FOUND',
        message: 'User has no uploaded avatar',
      });
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Avatar fetched successfully',
      avatarUrl: `http://localhost:3335${avatarurl}`,
    };
  }
}
