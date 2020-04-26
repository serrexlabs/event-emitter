import { EventEmitter } from 'events';

const PREFIX = '@@events-emitter-action/';

const DISPATCHED_ACTION = `${PREFIX}DISPATCHED`;
const SUBSCRIBED_ACTION = `${PREFIX}SUBSCRIBED`;
const UNSUBSCRIBED_ACTION = `${PREFIX}UNSUBSCRIBED`;

type MiddlewareParams<P, L> = {
  payload?: P;
  listener?: L;
  listenerCount?: number;
};

interface Listener<T> {
  (...args: Array<T>): void;
}

export interface Middleware {
  <P, L>(action: string, event: string, params: MiddlewareParams<P, L>): void;
}

export class Emitter {
  private eventEmitter: EventEmitter;

  private middleware: Array<Middleware>;

  public constructor(
    eventEmitter: EventEmitter,
    middleware?: Array<Middleware>
  ) {
    this.eventEmitter = eventEmitter;
    this.middleware = middleware || [];
  }

  public dispatch<T>(event: string, ...args: Array<T>) {
    this.sendThroughMiddleware(DISPATCHED_ACTION, event, args);
    this.eventEmitter.emit(event, args);
  }

  public subscribe<T>(event: string, listener: Listener<T>) {
    this.sendThroughMiddleware(SUBSCRIBED_ACTION, event, {}, listener);
    this.eventEmitter.addListener(event, listener);
  }

  public unsubscribe<T>(event: string, listener?: Listener<T>) {
    if (!listener) {
      this.sendThroughMiddleware(UNSUBSCRIBED_ACTION, event);
      this.eventEmitter.removeAllListeners(event);
      return;
    }
    this.sendThroughMiddleware(UNSUBSCRIBED_ACTION, event, listener);
    this.eventEmitter.removeListener(event, listener);
  }

  private sendThroughMiddleware(
    action: string,
    event: string,
    payload?: any,
    listener?: any
  ) {
    this.middleware.forEach((middleware: Middleware) => {
      middleware(action, event, {
        payload,
        listener: this.eventEmitter.listeners(event),
        listenerCount: this.eventEmitter.listenerCount(event),
      });
    });
  }
}

export function createEventEmitter(
  emitter: EventEmitter,
  middleware?: Array<Middleware>
): Emitter {
  return new Emitter(emitter, middleware);
}
