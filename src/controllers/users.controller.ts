import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { updateuserdto } from 'src/dtos/updateuser.dto';
import { createuserdto } from 'src/dtos/user.dto';
import { UsersService } from 'src/services/users.service';
import { EmailService } from 'src/services/email.service';
import { Jwtauthguard } from 'src/guards/jwtauth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private userservice: UsersService,
        private emailservice: EmailService
    ) {}

    // 🚨 PUBLIC route
    @Post('createuser')
    @ApiOperation({ summary: 'Create a user in database' })
    @ApiBody({ type: createuserdto })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async createuser(@Body() userdto: createuserdto) {
        const user = await this.userservice.creatuser(userdto);
        await this.emailservice.sendWelcomeEmail(user.email, user.id);
        return user;
    }

    // ✅ PROTECTED routes
    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Get('all')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getusers() {
        return this.userservice.getusers();
    }

    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getuserbyid(@Param('id') id: string) {
        return this.userservice.getuser(Number(id));
    }

    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Patch('updateuser/:id')
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: updateuserdto })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    updateUser(@Param('id') id: string, @Body() updateUserDto: updateuserdto) {
        return this.userservice.updateuser(Number(id), updateUserDto);
    }

    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Delete('delete/:id')
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    deleteuser(@Param('id') id: string) {
        return this.userservice.deleteuser(Number(id));
    }

    @UseGuards(Jwtauthguard)
    @ApiBearerAuth('access-token')
    @Patch(':id/avatar')
    @ApiOperation({ summary: 'Upload avatar for user' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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
        console.log(file);
        return this.userservice.uploadavatar(Number(id), file);
    }
}
