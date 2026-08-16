import {ContextId, ContextIdFactory, ContextIdResolver, ContextIdResolverFn, ContextIdStrategy, HostComponentInfo} from "@nestjs/core";
import { Request } from "express";
import { pick } from "accept-language-parser";

const SUPPORTED_LOCALES = ['en', 'ru'];
const DEFAULT_LOCALE = 'en';

export class AggregateByContextIdStrategy implements ContextIdStrategy {
    private readonly subTrees = new Map<string, ContextId>();

    attach(contextId: ContextId, request: Request): ContextIdResolverFn | ContextIdResolver | undefined {
        const tenantIdHeader = request.headers['x-tenant-id'];
        const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;

        const acceptLanguageHeader = request.headers['accept-language'];
        const locale = pick(SUPPORTED_LOCALES, acceptLanguageHeader ?? '') ?? DEFAULT_LOCALE;

        const groupKey = `${tenantId ?? 'no-tenant'}::${locale}`;

        let subTreeId: ContextId;
        if (this.subTrees.has(groupKey)) {
            subTreeId = this.subTrees.get(groupKey)!;
        } else {
            subTreeId = ContextIdFactory.create();
            this.subTrees.set(groupKey, subTreeId);
        }

        return {
            payload: { tenantId, locale },
            resolve: (info: HostComponentInfo) => info.isTreeDurable ? subTreeId : contextId
        }
    }
}
