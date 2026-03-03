import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ParentRepository } from '../../database/repositories/parent.repository';
import { LoginAttemptRepository } from '../../database/repositories/login-attempt.repository';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  private lockouts: Map<string, { count: number; lockedUntil: Date }> = new Map();

  constructor(
    private readonly parentRepo: ParentRepository,
    private readonly loginAttemptRepo: LoginAttemptRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async recordFailedAttempt(parentId: string | null, _mobileNumber: string): Promise<void> {
    if (parentId) {
      await this.loginAttemptRepo.create({ parentId, success: false });
    }
  }

  async login(mobileNumber: string, mpin: string): Promise<{ accessToken: string; expiresIn: string }> {
    const parent = await this.parentRepo.findByMobile(mobileNumber.trim());
    if (!parent) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    const lock = this.lockouts.get(parent.id);
    if (lock && lock.lockedUntil > new Date()) {
      const retryAfter = Math.ceil((lock.lockedUntil.getTime() - Date.now()) / 1000);
      throw new UnauthorizedException({
        code: 'LOCKED_OUT',
        message: 'Too many failed attempts. Try again later.',
        retryAfter,
      });
    }

    const valid = await bcrypt.compare(mpin, parent.mpinHash);
    if (!valid) {
      await this.recordFailedAttempt(parent.id, mobileNumber);
      const count = (this.lockouts.get(parent.id)?.count ?? 0) + 1;
      if (count >= LOCKOUT_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        this.lockouts.set(parent.id, { count, lockedUntil });
        const retryAfter = LOCKOUT_MINUTES * 60;
        throw new UnauthorizedException({
          code: 'LOCKED_OUT',
          message: `Too many failed attempts. Try again after ${LOCKOUT_MINUTES} minutes.`,
          retryAfter,
        });
      }
      this.lockouts.set(parent.id, { count, lockedUntil: new Date(0) });
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    }

    this.lockouts.delete(parent.id);
    await this.loginAttemptRepo.create({ parentId: parent.id, success: true });

    const expiresIn = this.config.get<string>('jwt.expiresIn') ?? '8h';
    const payload = {
      sub: parent.id,
      role: 'parent',
      linkedStudentId: parent.linkedStudentId,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn } as any);

    return { accessToken, expiresIn };
  }
}
