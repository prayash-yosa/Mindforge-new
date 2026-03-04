import { Controller, Post, Body } from '@nestjs/common';

@Controller('admin/auth')
export class AuthController {
  @Post('demo-login')
  demoLogin() {
    return {
      token: 'demo-admin-token',
      adminName: 'Admin User',
      adminId: 'admin-1',
    };
  }

  @Post('login')
  login(@Body() _body: { email: string; password: string }) {
    return {
      token: 'demo-admin-token',
      adminName: 'Admin User',
      adminId: 'admin-1',
    };
  }
}
