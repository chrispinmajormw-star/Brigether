import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MeetingsModule } from './meetings/meetings.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MeetingsModule],
  controllers: [HealthController],
})
export class AppModule {}
