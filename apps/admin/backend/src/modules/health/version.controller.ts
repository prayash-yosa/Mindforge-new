import { Controller, Get } from '@nestjs/common';

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    return {
      version: '1.0.0',
      service: 'admin-backend',
    };
  }
}
