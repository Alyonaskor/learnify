import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
   /*
   Return user by ID.
   If you need "Not found" - you can throw an exception manually,
   but for now we will return null if not found.
   */
   async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
    /* or:
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
    then Nest itself will return 500, you can intercept and transform it.
    */ 
  }
}