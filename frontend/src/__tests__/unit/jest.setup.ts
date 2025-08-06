import { TextEncoder } from 'util';
import { JestAssertionError } from 'expect';
import 'core-js/actual/array/to-sorted';
import '@testing-library/jest-dom';
import { BooleanValues, RenderHookResultExt, createComparativeValue } from './testUtils/hooks';

// Polyfill fetch for Jest environment
global.fetch = jest.fn((input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Mock different API endpoints
  if (url.includes('/api/v1/models')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [
            {
              value: 'model1',
              label: 'Model 1',
              displayName: 'Model 1',
              namespace: 'default',
              service: 'model1-service',
            },
            {
              value: 'model2',
              label: 'Model 2',
              displayName: 'Model 2',
              namespace: 'default',
              service: 'model2-service',
            },
          ],
        }),
    } as Response);
  }

  // Default response for other endpoints
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: [] }),
  } as Response);
});

global.TextEncoder = TextEncoder;

const tryExpect = (expectFn: () => void) => {
  try {
    expectFn();
  } catch (e) {
    const { matcherResult } = e as JestAssertionError;
    if (matcherResult) {
      return { ...matcherResult, message: () => matcherResult.message };
    }
    throw e;
  }
  return {
    pass: true,
    message: () => '',
  };
};

expect.extend({
  // custom asymmetric matchers

  /**
   * Checks that a value is what you expect.
   * It uses Object.is to check strict equality.
   *
   * Usage:
   * expect.isIdentifyEqual(...)
   */
  isIdentityEqual: (actual, expected) => ({
    pass: Object.is(actual, expected),
    message: () => `expected ${actual} to be identity equal to ${expected}`,
  }),

  // hook related custom matchers
  hookToBe: (actual: RenderHookResultExt<unknown, unknown>, expected) =>
    tryExpect(() => expect(actual.result.current).toBe(expected)),

  hookToStrictEqual: (actual: RenderHookResultExt<unknown, unknown>, expected) =>
    tryExpect(() => expect(actual.result.current).toStrictEqual(expected)),

  hookToHaveUpdateCount: (actual: RenderHookResultExt<unknown, unknown>, expected: number) =>
    tryExpect(() => expect(actual.getUpdateCount()).toBe(expected)),

  hookToBeStable: <R>(actual: RenderHookResultExt<R, unknown>, expected?: BooleanValues<R>) => {
    if (actual.getUpdateCount() <= 1) {
      throw new Error('Cannot assert stability as the hook has not run at least 2 times.');
    }
    if (typeof expected === 'undefined') {
      return tryExpect(() => expect(actual.result.current).toBe(actual.getPreviousResult()));
    }
    return tryExpect(() =>
      expect(actual.result.current).toStrictEqual(
        createComparativeValue(actual.getPreviousResult(), expected),
      ),
    );
  },
});
