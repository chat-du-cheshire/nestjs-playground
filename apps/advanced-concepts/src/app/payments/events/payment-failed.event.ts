import { ContextId } from "@nestjs/core";

export class PaymentFailedEvent {
    static readonly type = 'PAYMENT_FAILED';

    constructor(
        public readonly paymentId: string, 
        public readonly meta: {contextId: ContextId}
    ) {}
}