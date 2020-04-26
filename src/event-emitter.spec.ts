import { EventEmitter } from 'events';
import { createEventEmitter, Emitter } from './event-emitter';
jest.mock('events');

describe('Event Emitter', () => {
  it('should create emitter instance', function () {
    const emitter = createEventEmitter(new EventEmitter());
    expect(emitter).toBeInstanceOf(Emitter);
  });

  it('should dispatch event with given params', function () {
    const nodeEventEmitter = new EventEmitter();
    spyOn(nodeEventEmitter, 'emit');
    const emitter = createEventEmitter(nodeEventEmitter);
    emitter.dispatch('FAKE_EVENT', { fake: 'data' });

    expect(nodeEventEmitter.emit).toBeCalledTimes(1);
    expect(nodeEventEmitter.emit).toHaveBeenCalledWith('FAKE_EVENT', [
      {
        fake: 'data',
      },
    ]);
  });

  it('should subscribe a event with listener', function () {
    const nodeEventEmitter = new EventEmitter();
    const emitter = createEventEmitter(nodeEventEmitter);
    const listener = () => {};
    spyOn(nodeEventEmitter, 'addListener');
    emitter.subscribe('FAKE_EVENT', listener);

    expect(nodeEventEmitter.addListener).toBeCalledTimes(1);
    expect(nodeEventEmitter.addListener).toHaveBeenCalledWith(
      'FAKE_EVENT',
      listener
    );
  });

  it('should remove listener from given event', function () {
    const nodeEventEmitter = new EventEmitter();
    const emitter = createEventEmitter(nodeEventEmitter);
    const listener = () => {};
    spyOn(nodeEventEmitter, 'removeListener');
    emitter.unsubscribe('FAKE_EVENT', listener);

    expect(nodeEventEmitter.removeListener).toBeCalledTimes(1);
    expect(nodeEventEmitter.removeListener).toHaveBeenCalledWith(
      'FAKE_EVENT',
      listener
    );
  });

  it('should remove all listeners from given event', function () {
    const nodeEventEmitter = new EventEmitter();
    const emitter = createEventEmitter(nodeEventEmitter);
    spyOn(nodeEventEmitter, 'removeAllListeners');
    emitter.unsubscribe('FAKE_EVENT');

    expect(nodeEventEmitter.removeAllListeners).toBeCalledTimes(1);
    expect(nodeEventEmitter.removeAllListeners).toHaveBeenCalledWith(
      'FAKE_EVENT'
    );
  });

  describe('Middleware', () => {
    it('should accept middleware', function () {
      const middleware = (...args: Array<any>) => {};
      const emitter = createEventEmitter(new EventEmitter(), [middleware]);
      expect(emitter).toBeInstanceOf(Emitter);
    });

    it('should trigger middleware on dispatch', function () {
      const middleware = jest.fn();
      const emitter = createEventEmitter(new EventEmitter(), [middleware]);
      emitter.dispatch('FAKE_EVENT', { fake: 'data' });

      expect(middleware).toBeCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith(
        '@@events-emitter-action/DISPATCHED',
        'FAKE_EVENT',
        {
          listener: undefined,
          listenerCount: undefined,
          payload: [{ fake: 'data' }],
        }
      );
    });

    it('should trigger middleware on subscribe', function () {
      const middleware = jest.fn();
      const listener = () => {};
      const emitter = createEventEmitter(new EventEmitter(), [middleware]);
      emitter.subscribe('FAKE_EVENT', listener);

      expect(middleware).toBeCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith(
        '@@events-emitter-action/SUBSCRIBED',
        'FAKE_EVENT',
        {
          listener: undefined,
          listenerCount: undefined,
          payload: {},
        }
      );
    });

    it('should trigger middleware on unsubscribe', function () {
      const middleware = jest.fn();
      const emitter = createEventEmitter(new EventEmitter(), [middleware]);
      emitter.unsubscribe('FAKE_EVENT');

      expect(middleware).toBeCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith(
        '@@events-emitter-action/UNSUBSCRIBED',
        'FAKE_EVENT',
        {
          listener: undefined,
          listenerCount: undefined,
          payload: undefined,
        }
      );
    });
  });
});
