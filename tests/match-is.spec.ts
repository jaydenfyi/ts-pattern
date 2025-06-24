import { match, P } from '../src';
import { Expect, Equal } from '../src/types/helpers';

describe('match.is', () => {
  it('works with primitive patterns', () => {
    const value: unknown = 2;
    expect(match(value).is(P.number)).toBe(true);
    expect(match(value).is(P.string)).toBe(false);

    if (match(value).is(P.number)) {
      type t = Expect<Equal<typeof value, number>>;
    }
  });

  it('works with object patterns', () => {
    const value: unknown = { foo: 'bar' };
    expect(match(value).is({ foo: P.string })).toBe(true);
    expect(match(value).is({ foo: P.number })).toBe(false);

    if (match(value).is({ foo: P.string })) {
      type t = Expect<Equal<typeof value, { foo: string }>>;
    }
  });

  it('works with array patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(match(value).is(P.array(P.number))).toBe(true);
    expect(match(value).is(P.array(P.string))).toBe(false);

    if (match(value).is(P.array(P.number))) {
      type t = Expect<Equal<typeof value, number[]>>;
    }
  });
});
