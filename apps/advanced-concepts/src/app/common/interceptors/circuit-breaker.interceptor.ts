import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly failureThreshold = 3;
  private readonly resetTimeoutMs = 10_000;

  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private openedAt = 0;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.openedAt < this.resetTimeoutMs) {
        return throwError(
          () => new ServiceUnavailableException('Circuit is open, try again later'),
        );
      }

      this.state = CircuitState.HALF_OPEN;
    }

    return next.handle().pipe(
      tap(() => this.onSuccess()),
      catchError((error) => {
        this.onFailure();
        return throwError(() => error);
      }),
    );
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();
    }
  }
}
