import { Injectable } from '@nestjs/common';
import { ParentRepository } from '../../database/repositories/parent.repository';

/** Default dev student (Aarav Kumar) — matches Student app seed externalId 12131 */
const DEFAULT_CHILD_EXTERNAL_ID = '12131';

@Injectable()
export class ProfileService {
  constructor(private readonly parentRepo: ParentRepository) {}

  async getProfile(parentId: string) {
    const parent = await this.parentRepo.findById(parentId);
    if (!parent) return null;

    const isDefaultChild = parent.studentExternalId === DEFAULT_CHILD_EXTERNAL_ID;
    const childName = isDefaultChild ? 'Aarav Kumar' : 'Child';
    const childClass = isDefaultChild ? '8' : '-';
    const childSection = isDefaultChild ? 'A' : '';

    return {
      parent: {
        id: parent.id,
        name: parent.name,
        mobileNumber: parent.mobileNumber,
        relationship: parent.relationship,
        status: parent.status,
      },
      child: {
        linkedStudentId: parent.linkedStudentId,
        name: childName,
        class: childClass,
        section: childSection,
      },
    };
  }
}
