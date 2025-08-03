import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // export PrismaService so it can be used in other modules
})
export class PrismaModule {}