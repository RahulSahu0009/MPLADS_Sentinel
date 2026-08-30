/*
FILE: backend/src/repositories/user.repository.js
PURPOSE:
Encapsulate Prisma data access for user records, including role and authorization details.
*/

import { prisma } from '../config/prisma.js';

export class UserRepository {
  async findByEmail(email) {
    if (!email) {
      throw new Error('UserRepository.findByEmail requires email');
    }

    return prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async findById(id) {
    if (!id) {
      throw new Error('UserRepository.findById requires id');
    }

    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }
}
