"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
function generateCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++)
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
}
let MeetingsService = class MeetingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(hostId, dto) {
        let code = generateCode();
        while (await this.prisma.meeting.findUnique({ where: { code } }))
            code = generateCode();
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
    async byCode(code) {
        const m = await this.prisma.meeting.findUnique({ where: { code: code.toUpperCase() } });
        if (!m)
            throw new common_1.NotFoundException('Meeting not found');
        return m;
    }
    async listForHost(hostId) {
        return this.prisma.meeting.findMany({
            where: { hostId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async end(meetingId, hostId) {
        const m = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!m)
            throw new common_1.NotFoundException();
        if (m.hostId !== hostId)
            throw new common_1.ForbiddenException();
        return this.prisma.meeting.update({ where: { id: meetingId }, data: { status: 'ended' } });
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], MeetingsService);
