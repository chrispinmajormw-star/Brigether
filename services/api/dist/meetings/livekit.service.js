"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivekitService = void 0;
const common_1 = require("@nestjs/common");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivekitService = class LivekitService {
    constructor() {
        this.key = process.env.LIVEKIT_API_KEY ?? 'devkey';
        this.secret = process.env.LIVEKIT_API_SECRET ?? 'secret';
    }
    async tokenFor(roomName, identity, name) {
        const at = new livekit_server_sdk_1.AccessToken(this.key, this.secret, { identity, name, ttl: '4h' });
        at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        return await at.toJwt();
    }
};
exports.LivekitService = LivekitService;
exports.LivekitService = LivekitService = __decorate([
    (0, common_1.Injectable)()
], LivekitService);
