import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ParentRepository } from '../repositories/parent.repository';

/** Test parent credentials — parent of Aarav Kumar (Student app default) */
const TEST_MOBILE = '9876543210';
const TEST_MPIN = '123456';

/** Aarav Kumar externalId — matches Student app seed and Teacher class_student.studentId */
const AARAV_EXTERNAL_ID = '12131';

@Injectable()
export class DevSeederService implements OnModuleInit {
  private readonly logger = new Logger(DevSeederService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly parentRepo: ParentRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get<boolean>('isProduction')) return;

    const existing = await this.parentRepo.findByMobile(TEST_MOBILE);
    if (existing) {
      this.logger.log('Parent test account already seeded.');
      return;
    }

    const linkedStudentId =
      this.config.get<string>('parentDevLinkedStudentId') || '00000000-0000-0000-0000-000000000001';
    const studentExternalId = this.config.get<string>('parentDevExternalId') || AARAV_EXTERNAL_ID;

    const mpinHash = await bcrypt.hash(TEST_MPIN, 10);
    await this.parentRepo.create({
      mobileNumber: TEST_MOBILE,
      mpinHash,
      name: 'Rajesh Kumar',
      relationship: 'FATHER',
      linkedStudentId,
      studentExternalId,
      status: 'ACTIVE',
    });

    this.logger.log(
      `Seeded test parent: ${TEST_MOBILE} (MPIN ${TEST_MPIN}) — linked to Aarav Kumar (externalId ${studentExternalId})`,
    );
    if (!this.config.get<string>('parentDevLinkedStudentId')) {
      this.logger.warn(
        'Set PARENT_DEV_LINKED_STUDENT_ID to Student UUID for full Student API sync. Teacher sync uses externalId.',
      );
    }
  }
}
