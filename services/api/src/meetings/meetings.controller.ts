import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { MeetingsService } from './meetings.service';
import { LivekitService } from './livekit.service';
import { CreateMeetingDto, JoinDto } from './dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService, private readonly livekitService: LivekitService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(req.user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Get('mine')
  mine(@Req() req: any) {
    return this.meetingsService.listForHost(req.user.id);
  }

  @Get(':code')
  byCode(@Param('code') code: string) {
    return this.meetingsService.byCode(code);
  }

  @Post(':code/token')
  async token(@Param('code') code: string, @Body() body: JoinDto) {
    const meeting = await this.meetingsService.byCode(code);
    const identity = `${body.displayName ?? 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
    const token = await this.livekitService.tokenFor(meeting.code, identity, body.displayName ?? 'Guest');
    return { token, url: process.env.LIVEKIT_URL ?? 'ws://localhost:7880', room: meeting.code };
  }

  @UseGuards(JwtGuard)
  @Post(':id/end')
  end(@Req() req: any, @Param('id') id: string) {
    return this.meetingsService.end(id, req.user.id);
  }
}
