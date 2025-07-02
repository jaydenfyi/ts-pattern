import { isStrict as is, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('isStrict', () => {

  it('should act as a type guard function if given a two arguments', () => {
    const something: unknown = {
      title: 'Hello',
      author: { name: 'Gabriel', age: 27 },
    };

    if (
      is(
        something,
        {
          title: P.string,
          author: { name: P.string, age: P.number },
        }
      )
    ) {
      type t = Expect<
        Equal<
          typeof something,
          { title: string; author: { name: string; age: number } }
        >
      >;
      expect(true).toBe(true);
    } else {
      throw new Error(
        'is should have returned true but it returned false'
      );
    }
  });

  it('should work with object patterns', () => {
    const value: unknown = { foo: true };
    expect(is(value, { foo: true })).toEqual(true);
    expect(is(value, { foo: 'true' })).toEqual(false);
  });

  it('should work with array patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(is(value, P.array(P.number))).toEqual(true);
    expect(is(value, P.array(P.string))).toEqual(false);
  });

  it('should work with variadic patterns', () => {
    const value: unknown = [1, 2, 3];
    expect(is(value, [1, ...P.array(P.number)])).toEqual(true);
    expect(is(value, [2, ...P.array(P.number)])).toEqual(false);
  });

  it('should work with primitive patterns', () => {
    const value: unknown = 1;
    expect(is(value, P.number)).toEqual(true);
    expect(is(value, P.boolean)).toEqual(false);
  });

  it('should work with literal patterns', () => {
    const value: unknown = 1;
    expect(is(value, 1)).toEqual(true);
    expect(is(value, 'oops')).toEqual(false);
  });

  it('should work with union and intersection patterns', () => {
    const value: unknown = { foo: true };
    expect(is(value, P.union({ foo: true }, { bar: false }))).toEqual(true);

    expect(is(value, P.union({ foo: false }, { bar: false }))).toEqual(false);
  });

  type Pizza = { type: 'pizza'; topping: string };
  type Sandwich = { type: 'sandwich'; condiments: string[] };
  type Food = Pizza | Sandwich;

  it('type inference should be precise without `as const`', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    if (is(food, { type: 'pizza' })) {
      type t = Expect<Equal<typeof food, Pizza>>;
    } else {
      throw new Error('Expected food to match the pizza pattern!');
    }
  });

  it('should reject invalid pattern when two parameters are passed', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    is(
      food,
      // @ts-expect-error
      {
        type: 'oops',
      }
    );
  });

  it('should allow patterns targetting one member of a union type', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;
    expect(is(food, { topping: 'cheese' })).toBe(true);

    if (is(food, { topping: 'cheese' })) {
      type t = Expect<
        Equal<typeof food, Pizza & { topping: 'cheese'; type: 'pizza' }>
      >;
    }
  });

  it('should reject patterns targetting unknown properties', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;

    // @ts-expect-error - unknown properties are not allowed with isStrict
    is(food, { unknownProp: P.instanceOf(Error) });
  });

  it('should correctly narrow undiscriminated unions of objects.', () => {
    type Input = { someProperty: string[] } | { this: 'is a string' };
    const input = { someProperty: ['hello'] } satisfies Input as Input;

    if (is(input, { someProperty: P.array() })) {
      expect(input.someProperty).toEqual(['hello']);
      type t = Expect<Equal<typeof input.someProperty, string[]>>;
    } else {
      throw new Error('pattern should match');
    }
  });
});
