import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeysService } from '../api-keys.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from '../../../users/api-keys/entitites/api-key.entity';
import { Repository } from 'typeorm';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('Unauthorized: API key is missing');
    }
    const apiKeyEntityId = this.apiKeysService.extractIdFromApiKey(apiKey);

    try {
      const apiKeyEntity = await this.apiKeyRepository.findOne({
        where: { uuid: apiKeyEntityId },
        relations: { user: true },
      });

      if (!apiKeyEntity) {
        throw new UnauthorizedException('Unauthorized: Invalid API key');
      }

      const isValid = await this.apiKeysService.validate(
        apiKey,
        apiKeyEntity.key,
      );

      if (!isValid) {
        throw new UnauthorizedException('Unauthorized: Invalid API key');
      }

      request[REQUEST_USER_KEY] = {
        sub: apiKeyEntity.user.id,
        email: apiKeyEntity.user.email,
        role: apiKeyEntity.user.role,
        permissions: apiKeyEntity.user.permissions,
      } as ActiveUserData;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized: Invalid API key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | null {
    const [type, key] = request.headers['authorization']?.split(' ') ?? [];

    return type === 'ApiKey' ? key : null;
  }
}
