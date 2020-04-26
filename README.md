Sample

```ts
import { EventEmitter } from 'events';
import { createEventEmitter, Middleware } from './event-emitter';
import logger from './middleware/logger-middleware';

const middleware: Array<Middleware> = [];

if (process.env.NODE_ENV === 'development') {
    middleware.push(logger);
}

export const event = createEventEmitter(new EventEmitter(), middleware);

```