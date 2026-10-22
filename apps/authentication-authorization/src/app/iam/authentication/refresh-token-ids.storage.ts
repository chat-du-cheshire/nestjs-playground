import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';

export class InvalidateRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redis!: Redis;

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

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
    await this.redis.set(
      this.getKey(userId),
      token,
      'EX',
      this.jwtConfiguration.refreshTokenTtl,
    );
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
