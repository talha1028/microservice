import { 
  Controller, Get, Post, Param, Delete, UseGuards, 
  HttpCode, HttpStatus, Patch, Body 
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../entities/user.entity';
import { UsersService } from 'src/services/users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Jwtauthguard } from '../guards/jwtauth.guard';
import { updateuserdto } from 'src/dtos/updateuser.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(Jwtauthguard, RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  // 👑 Only SUPERADMIN can manage admins
  @Get('all-admins')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all admins (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  findAllAdmins() {
    return "All admins data (accessible by SuperAdmin only)";
  }

  @Post('promote/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promote a user to Admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User promoted to Admin' })
  promoteUserToAdmin(@Param('id') id: number) {
    return `User ${id} promoted to Admin (SuperAdmin only)`;
  }

  @Post('demote/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demote an Admin back to User' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Admin demoted to User' })
  demoteAdmin(@Param('id') id: number) {
    return `Admin ${id} demoted back to User (SuperAdmin only)`;
  }

  // 🔍 View all users
  @Get('users')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View all users (SuperAdmin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  getAllUsers() {
    return this.usersService.getusers();
  }

  // 🔍 View single user by ID
  @Get('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('id') id: string) {
    return this.usersService.getuser(Number(id));
  }

  // ✏️ Update user (SuperAdmin override)
  @Patch('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: updateuserdto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateUser(@Param('id') id: string, @Body() updateUserDto: updateuserdto) {
    return this.usersService.updateuser(Number(id), updateUserDto);
  }

  // ❌ Delete user
  @Delete('users/:id')
  @Roles(UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT) // ✅ REST best practice for delete
  @ApiOperation({ summary: 'Delete user by ID (SuperAdmin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteuser(Number(id));
  }
}
