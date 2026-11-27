import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private key = process.env.LIVEKIT_API_KEY ?? 'devkey';
  private secret = process.env.LIVEKIT_API_SECRET ?? 'secret';

  async tokenFor(roomName: string, identity: string, name: string) {
    const at = new AccessToken(this.key, this.secret, { identity, name, ttl: '4h' });
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    return await at.toJwt();
  }
}
