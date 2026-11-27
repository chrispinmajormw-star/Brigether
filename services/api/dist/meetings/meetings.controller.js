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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/jwt.guard");
const meetings_service_1 = require("./meetings.service");
const livekit_service_1 = require("./livekit.service");
const dto_1 = require("./dto");
let MeetingsController = class MeetingsController {
    constructor(meetingsService, livekitService) {
        this.meetingsService = meetingsService;
        this.livekitService = livekitService;
    }
    create(req, dto) {
        return this.meetingsService.create(req.user.id, dto);
    }
    mine(req) {
        return this.meetingsService.listForHost(req.user.id);
    }
    byCode(code) {
        return this.meetingsService.byCode(code);
    }
    async token(code, body) {
        const meeting = await this.meetingsService.byCode(code);
        const identity = `${body.displayName ?? 'guest'}-${Math.random().toString(36).slice(2, 8)}`;
        const token = await this.livekitService.tokenFor(meeting.code, identity, body.displayName ?? 'Guest');
        return { token, url: process.env.LIVEKIT_URL ?? 'ws://localhost:7880', room: meeting.code };
    }
    end(req, id) {
        return this.meetingsService.end(id, req.user.id);
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "byCode", null);
__decorate([
    (0, common_1.Post)(':code/token'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.JoinDto]),
    __metadata("design:returntype", Promise)
], MeetingsController.prototype, "token", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)(':id/end'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "end", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, common_1.Controller)('meetings'),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService, livekit_service_1.LivekitService])
], MeetingsController);
