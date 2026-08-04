import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const authorization = request.headers['authorization'];
        const apiKey = this.configService.get<string>('API_KEY');

        if (!apiKey) {
            throw new Error('API_KEY is not configured');
        }

        if (authorization !== apiKey) {
            throw new UnauthorizedException();
        }

        return true;
    }
}