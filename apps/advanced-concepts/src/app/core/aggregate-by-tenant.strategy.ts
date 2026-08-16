import {ContextId, ContextIdFactory, ContextIdResolver, ContextIdResolverFn, ContextIdStrategy, HostComponentInfo} from "@nestjs/core";
import { Request } from "express";

export class AggregateByContextIdStrategy implements ContextIdStrategy {
    private readonly tenants = new Map<string, ContextId>();

    attach(contextId: ContextId, request: Request): ContextIdResolverFn | ContextIdResolver | undefined {
        const tenantIdHeader = request.headers['x-tenant-id'];
        const tenantId = Array.isArray(tenantIdHeader) ? tenantIdHeader[0] : tenantIdHeader;

        if (!tenantId) {
            return () => contextId;
        }
        
        let tenantSubTreeId: ContextId;
        if (this.tenants.has(tenantId)) {
            tenantSubTreeId = this.tenants.get(tenantId)!;
        } else {
            tenantSubTreeId = ContextIdFactory.create();
            this.tenants.set(tenantId, tenantSubTreeId);
        }

        return {
            payload: { tenantId },
            resolve: (info: HostComponentInfo) => info.isTreeDurable ? tenantSubTreeId : contextId
        }
    }
}