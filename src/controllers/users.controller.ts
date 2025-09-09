import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { updateuserdto } from 'src/dtos/updateuser.dto';
import { createuserdto } from 'src/dtos/user.dto';
import { UsersService } from 'src/services/users.service';
import { EmailService } from 'src/services/email.service';

@ApiTags('Users') // Groups endpoints under "Users" in Swagger
@Controller('users')
export class UsersController {
    constructor(
        private userservice: UsersService,
        private emailservice: EmailService
        
    ) { }
        
    @Post('createuser')
    @ApiOperation({summary: 'Create a user in database'})
    @ApiBody({type: createuserdto})
    async createuser(
        @Body()userdto: createuserdto
    ){
        const user = await this.userservice.creatuser(userdto);
        
        await this.emailservice.sendWelcomeEmail(user.email,user.id)
        return user
    }
    
    
    @Get('all')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    getusers() {
        return this.userservice.getusers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    getuserbyid(@Param('id') id: string) {
        return this.userservice.getuser(Number(id));
    }

    @Patch('updateuser/:id')
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: updateuserdto })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: updateuserdto
    ) {
        return this.userservice.updateuser(Number(id), updateUserDto);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    deleteuser(@Param('id') id: string) {
        return this.userservice.deleteuser(Number(id));
    }

    @Patch(':id/avatar')
    @ApiOperation({ summary: 'Upload avatar for user' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiConsumes('multipart/form-data') // Tell Swagger this is a file upload
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary', // This is key for Swagger UI to show file picker
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        console.log(file);
        return this.userservice.uploadavatar(Number(id), file);
    }
}
