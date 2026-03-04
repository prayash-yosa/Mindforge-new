import { Controller, Get, Post, Patch, Param, Query } from '@nestjs/common';
import { UserManagementService } from './user-management.service';

@Controller('admin/users')
export class UserManagementController {
  constructor(private readonly userService: UserManagementService) {}

  @Get('pending')
  async listPending(@Query('role') role?: string) {
    const data = await this.userService.listPending(role);
    return { data };
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const data = await this.userService.approve(id, 'admin');
    return { data };
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    const data = await this.userService.reject(id);
    return { data };
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    const data = await this.userService.activate(id);
    return { data };
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const data = await this.userService.deactivate(id);
    return { data };
  }
}
