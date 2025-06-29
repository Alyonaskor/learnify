import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // makes the provider available in ALL modules without import
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // export PrismaService so it can be used in other modules
})
export class PrismaModule {}