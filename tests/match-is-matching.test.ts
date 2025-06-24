import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('match(value, pattern)', () => {
  it('should act as a type guard when given a pattern', () => {
    const something: unknown = {
      title: 'Hello',
      author: { name: 'Gabriel', age: 27 },
    };

    if (
      match(something, {
        title: P.string,
        author: { name: P.string, age: P.number },
      })
    ) {
      type t = Expect<
        Equal<
          typeof something,
          { title: string; author: { name: string; age: number } }
        >
      >;
      expect(true).toBe(true);
    } else {
      throw new Error('match should have returned true but it returned false');
    }
  });

  it('should work with object patterns', () => {
    const value: unknown = { foo: true };
    expect(match(value, { foo: true })).toEqual(true);
    expect(match(value, { foo: 'true' })).toEqual(false);
  });

  it('should work with array patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(match(value, P.array(P.number))).toEqual(true);
    expect(match(value, P.array(P.string))).toEqual(false);
  });

  it('should work with variadic patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(match(value, [1, ...P.array(P.number)])).toEqual(true);
    expect(match(value, [2, ...P.array(P.number)])).toEqual(false);
  });

  it('should work with primitive patterns', () => {
    const value: unknown = 1;
    expect(match(value, P.number)).toEqual(true);
    expect(match(value, P.boolean)).toEqual(false);
  });

  it('should work with literal patterns', () => {
    const value: unknown = 1;
    expect(match(value, 1)).toEqual(true);
    expect(match(value, 'oops')).toEqual(false);
  });

  it('should work with union and intersection patterns', () => {
    const value: unknown = { foo: true };
    expect(match(value, P.union({ foo: true }, { bar: false }))).toEqual(true);
    expect(match(value, P.union({ foo: false }, { bar: false }))).toEqual(
      false
    );
  });

  type Pizza = { type: 'pizza'; topping: string };
  type Sandwich = { type: 'sandwich'; condiments: string[] };
  type Food = Pizza | Sandwich;

  it('type inference should be precise without `as const`', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    if (match(food, { type: 'pizza' })) {
      type t = Expect<Equal<typeof food, Pizza>>;
    } else {
      throw new Error('Expected food to match the pizza pattern!');
    }
  });

  it('should reject invalid pattern when two parameters are passed', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    match(
      food,
      // @ts-expect-error
      {
        type: 'oops',
      }
    );
  });

  it('should allow patterns targetting one member of a union type', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;
    expect(match(food, { topping: 'cheese' })).toBe(true);

    if (match(food, { topping: 'cheese' })) {
      type t = Expect<
        Equal<typeof food, Pizza & { topping: 'cheese'; type: 'pizza' }>
      >;
    }
  });

  it('should allow targetting unknown properties', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    expect(match(food, { unknownProp: P.instanceOf(Error) })).toBe(false);

    if (match(food, { unknownProp: P.instanceOf(Error) })) {
      type t = Expect<Equal<typeof food, Food & { unknownProp: Error }>>;
    }
  });

  it('should correctly narrow undiscriminated unions of objects.', () => {
    type Input = { someProperty: string[] } | { this: 'is a string' };
    const input = { someProperty: ['hello'] } satisfies Input as Input;

    if (match(input, { someProperty: P.array() })) {
      expect(input.someProperty).toEqual(['hello']);
      type t = Expect<Equal<typeof input.someProperty, string[]>>;
    } else {
      throw new Error('pattern should match');
    }
  });
});
