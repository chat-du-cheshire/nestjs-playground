import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class EventContext {
    constructor(@Inject(REQUEST) public readonly request: Request) {}
}
