import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

export class InvalidateRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redis!: Redis;

  onApplicationBootstrap() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  onApplicationShutdown(signal?: string) {
    return this.redis.quit();
  }

  async insert(userId: number, token: string) {
    await this.redis.set(this.getKey(userId), token);
  }

  async validate(userId: number, token: string) {
    const stored = await this.redis.get(this.getKey(userId));
    const isValid = stored === token;

    if (!isValid) {
      throw new InvalidateRefreshTokenError();
    }

    return isValid;
  }

  async invalidate(userId: number) {
    await this.redis.del(this.getKey(userId));
  }

  private getKey(userId: number) {
    return `user-${userId}`;
  }
}
