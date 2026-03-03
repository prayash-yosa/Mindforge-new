import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('parent/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto) {
    const { accessToken, expiresIn } = await this.authService.login(dto.mobileNumber, dto.mpin);
    return { accessToken, expiresIn, tokenType: 'Bearer' };
  }
}
