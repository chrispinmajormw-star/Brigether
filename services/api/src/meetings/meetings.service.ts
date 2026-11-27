import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMeetingDto } from './dto';

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async create(hostId: string, dto: CreateMeetingDto) {
    let code = generateCode();
    while (await this.prisma.meeting.findUnique({ where: { code } })) code = generateCode();
    return this.prisma.meeting.create({
      data: {
        hostId,
        code,
        title: dto.title,
        scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : null,
        scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : null,
        timezone: dto.timezone ?? 'Africa/Blantyre',
        recordingEnabled: dto.recordingEnabled ?? false,
        lowBandwidthDefault: dto.lowBandwidthDefault ?? false,
        status: dto.scheduledStart ? 'scheduled' : 'live',
      },
    });
  }

  async byCode(code: string) {
    const m = await this.prisma.meeting.findUnique({ where: { code: code.toUpperCase() } });
    if (!m) throw new NotFoundException('Meeting not found');
    return m;
  }

  async listForHost(hostId: string) {
    return this.prisma.meeting.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async end(meetingId: string, hostId: string) {
    const m = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!m) throw new NotFoundException();
    if (m.hostId !== hostId) throw new ForbiddenException();
    return this.prisma.meeting.update({ where: { id: meetingId }, data: { status: 'ended' } });
  }
}
