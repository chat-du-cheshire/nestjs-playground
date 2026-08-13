import { Injectable } from '@nestjs/common';
import { PaymentFailedEvent } from './events/payment-failed.event';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ModuleRef } from '@nestjs/core';
import { EventContext } from './context/event-context';


@Injectable()
export class SubscriptionsService {
constructor(private readonly eventEmitter: EventEmitter2, private readonly moduleRef: ModuleRef) {}

    @OnEvent(PaymentFailedEvent.type)
    async cancelSubscription(event: PaymentFailedEvent) {
        const eventContext = await this.moduleRef.resolve(EventContext, event.meta.contextId);

        console.log(`Cancelling subscription for paymentId: ${event.paymentId}, contextId: ${event.meta.contextId}`, eventContext.request.url);
    }
}
