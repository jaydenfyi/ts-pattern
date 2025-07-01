import { isStricter as is, P } from '../src';
import { Expect, Equal } from '../src/types/helpers';

describe('isStricter', () => {
  type Pizza = { type: 'pizza'; topping: string };
  type Sandwich = { type: 'sandwich'; condiments: string[] };
  type Food = Pizza | Sandwich;

  it('should reject explicit undefined for non optional property', () => {
    const food = { type: 'pizza', topping: 'cheese' } as Food;
    // @ts-expect-error - "type" cannot be explicitly undefined
    is(food, { type: undefined });
  });

  it('should accept explicit undefined when allowed', () => {
    type MaybeFood = { type?: 'pizza' };
    const val: MaybeFood = {};
    expect(is(val, { type: undefined })).toBe(true);
  });
});
