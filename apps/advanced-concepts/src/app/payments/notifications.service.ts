import { Injectable } from '@nestjs/common';
import { PaymentFailedEvent } from './events/payment-failed.event';
import { OnEvent } from '@nestjs/event-emitter';
import { ModuleRef } from '@nestjs/core';
import { EventContext } from './context/event-context';

@Injectable()
export class NotificationsService {
    constructor(private readonly moduleRef: ModuleRef) {}

    @OnEvent(PaymentFailedEvent.type)
    async sendPaymentNotification(event: PaymentFailedEvent) {
        const eventContext = await this.moduleRef.resolve(EventContext, event.meta.contextId);

        console.log(`Payment failed for paymentId: ${event.paymentId}, contextId: ${event.meta.contextId}`, eventContext.request.url);
    }
}
