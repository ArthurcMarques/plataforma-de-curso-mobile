// Compartilha a política entre services e guard sem depender do módulo de login.
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessPolicyService } from './access-policy.service';

@Module({
  imports: [PrismaModule],
  providers: [AccessPolicyService],
  exports: [AccessPolicyService],
})
export class AccessPolicyModule {}
