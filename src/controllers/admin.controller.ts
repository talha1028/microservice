import { 
  Controller, Get, Post, Param, Delete, UseGuards, 
  HttpCode, HttpStatus, Patch, Body 
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { UsersService } from 'src/services/users.service';
import { AdminService } from 'src/services/admin.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Jwtauthguard } from '../guards/jwtauth.guard';
import { updateuserdto } from 'src/dtos/updateuser.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(Jwtauthguard, RolesGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService
  ) {}

  // 👑 Only SUPERADMIN can manage admins
  @Get('all-admins')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all admins (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  async findAllAdmins() {
    const admins = await this.adminService.findAllAdmins();
    return { message: 'All admins retrieved successfully', data: admins };
  }

  @Post('promote/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote a user to Admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User promoted to Admin' })
  async promoteUserToAdmin(@Param('id') id: number) {
    const user = await this.adminService.promoteUserToAdmin(id);
    return { message: `User with ID ${id} promoted to Admin`, data: user };
  }

  @Post('demote/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demote an Admin back to User' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Admin demoted to User' })
  async demoteAdmin(@Param('id') id: number) {
    const user = await this.adminService.demoteAdmin(id);
    return { message: `Admin with ID ${id} demoted to User`, data: user };
  }

  // 🔍 View all users
  @Get('users')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View all users (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers() {
    const users = await this.usersService.getusers();
    return { message: 'All users retrieved successfully', data: users };
  }

  // 🔍 View single user by ID
  @Get('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getuser(Number(id));
    return { message: 'User retrieved successfully', data: user };
  }

  // ✏️ Update user (SuperAdmin override)
  @Patch('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: updateuserdto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: updateuserdto) {
    const user = await this.usersService.updateuser(Number(id), updateUserDto);
    return { message: 'User updated successfully', data: user };
  }

  // ❌ Delete user
  @Delete('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK) // returning message instead of 204 so we can include confirmation
  @ApiOperation({ summary: 'Delete user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteuser(Number(id));
    return { message: `User with ID ${id} deleted successfully` };
  }
}
