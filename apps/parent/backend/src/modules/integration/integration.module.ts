import { Global, Module } from '@nestjs/common';
import { TeacherSyncService } from './teacher-sync.service';

@Global()
@Module({
  providers: [TeacherSyncService],
  exports: [TeacherSyncService],
})
export class IntegrationModule {}
