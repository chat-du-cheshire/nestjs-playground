import { Controller, Get, Req } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentFailedEvent } from './events/payment-failed.event';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

@Controller('payments-webhook')
export class PaymentsWebhookController {
    constructor(private readonly eventEmitter: EventEmitter2, private readonly moduleRef: ModuleRef) {}

    @Get()
    webhook(@Req() request: Request) {
        const contextId = ContextIdFactory.create();
        const paymentId = crypto.randomUUID();

        this.moduleRef.registerRequestByContextId(request, contextId);

        this.eventEmitter.emit(PaymentFailedEvent.type, new PaymentFailedEvent(paymentId, { contextId }));
    }
}
