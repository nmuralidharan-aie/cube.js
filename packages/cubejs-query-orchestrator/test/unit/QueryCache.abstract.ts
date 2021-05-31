import crypto from 'crypto';
import { pausePromise } from '@cubejs-backend/shared';

import { QueryCache } from '../../src';

export const QueryCacheTest = (name: string, options?: any) => {
  describe(`QueryQueue${name}`, () => {
    const cache = new QueryCache(
      crypto.randomBytes(16).toString('hex'),
      jest.fn(() => {
        throw new Error('It`s not implemented mock...');
      }),
      jest.fn(),
      options,
    );

    afterAll(async () => {
      await cache.cleanup();
    });

    it('withLock', async () => {
      const RANDOM_KEY_CACHE = crypto.randomBytes(16).toString('hex');

      const testLock = async () => {
        let started = 0;
        let finished = 0;

        const doLock = (sleep: number) => cache.withLock(
          RANDOM_KEY_CACHE,
          async () => {
            started++;

            await pausePromise(sleep);

            finished++;
          },
          60 * 10
        );

        const locks = await Promise.all([
          doLock(1000),
          doLock(1000),
          doLock(1000),
        ]);
        expect(locks[0]).toEqual(true);
        expect(locks[1]).toEqual(false);
        expect(locks[2]).toEqual(false);

        expect(started).toEqual(1);
        expect(finished).toEqual(1);
      };

      await testLock();

      await pausePromise(500);

      await testLock();
    });
  });
};
