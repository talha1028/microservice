import { 
    Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, 
    UseInterceptors, UseGuards, HttpCode, HttpStatus 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
    ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, 
    ApiConsumes, ApiBearerAuth 
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
        private emailservice: EmailService
    ) {}

    // 🚨 PUBLIC route
    @Post('createuser')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a user in database' })
    @ApiBody({ type: createuserdto })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async createuser(@Body() userdto: createuserdto) {
        const user = await this.userservice.creatuser(userdto);
        await this.emailservice.sendWelcomeEmail(user.email, user.id);
        return user;
    }

    // ✅ ADMIN / SUPERADMIN only
    @UseGuards(Jwtauthguard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth('access-token')
    @Get('all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all users (admin/superadmin only)' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    getusers() {
        return this.userservice.getusers();
    }

    // ✅ Owner OR Admin
    @UseGuards(Jwtauthguard, OwnershipGuard)
    @ApiBearerAuth('access-token')
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get user by ID (owner or admin)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    getuserbyid(@Param('id') id: string) {
        return this.userservice.getuser(Number(id));
    }

    // ✅ Owner OR Admin
    @UseGuards(Jwtauthguard, OwnershipGuard)
    @ApiBearerAuth('access-token')
    @Patch('updateuser/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update user by ID (owner or admin)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: updateuserdto })
    updateUser(@Param('id') id: string, @Body() updateUserDto: updateuserdto) {
        return this.userservice.updateuser(Number(id), updateUserDto);
    }

    // ✅ Owner OR Admin
    @UseGuards(Jwtauthguard, OwnershipGuard)
    @ApiBearerAuth('access-token')
    @Delete('delete/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user by ID (owner or admin)' })
    @ApiParam({ name: 'id', type: Number })
    deleteuser(@Param('id') id: string) {
        return this.userservice.deleteuser(Number(id));
    }

    // ✅ Owner OR Admin
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
    async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return this.userservice.uploadavatar(Number(id), file);
    }
}
