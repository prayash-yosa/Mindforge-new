import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Parent } from '../../common/decorators/parent.decorator';
import type { AuthenticatedParent } from '../../common/guards/auth.guard';

@Controller('parent')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profile')
  async getProfile(@Parent() parent: AuthenticatedParent) {
    const profile = await this.profileService.getProfile(parent.parentId);
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }
    return { success: true, data: profile };
  }

  @Get('auth/me')
  async me(@Parent() parent: AuthenticatedParent) {
    const profile = await this.profileService.getProfile(parent.parentId);
    if (!profile) {
      return { success: false, message: 'Profile not found' };
    }
    return { success: true, data: profile };
  }
}
