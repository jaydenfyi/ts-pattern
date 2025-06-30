import { match, P } from '../src';
import { Expect, Equal } from '../src/types/helpers';

describe('match.is', () => {
  it('should narrow the value when used inside if', () => {
    type Pizza = { type: 'pizza'; topping: string };
    type Sandwich = { type: 'sandwich'; condiments: string[] };
    const food: Pizza | Sandwich = { type: 'pizza', topping: 'cheese' } as Pizza | Sandwich;
    const m = match(food);
    if (m.is({ type: 'pizza' as const })) {
      type t = Expect<Equal<typeof m.value, Pizza>>;
    }
  });

  it('should return the handler result when pattern matches', () => {
    type Pizza = { type: 'pizza'; topping: string };
    type Sandwich = { type: 'sandwich'; condiments: string[] };
    const food: Pizza | Sandwich = { type: 'pizza', topping: 'pepperoni' };

    const m = match(food);
    const topping = m.is({ type: 'pizza' as const }, (p) => {
      type t = Expect<Equal<typeof p, Pizza>>;
      return p.topping;
    });

    type t = Expect<Equal<typeof topping, string>>;
    expect(topping).toBe('pepperoni');

    const m2 = match<Pizza | Sandwich>({
      type: 'sandwich',
      condiments: ['mayo'],
    });

    const noTopping = m2.is({ type: 'pizza' as const }, (p) => p.topping);

    type t2 = Expect<Equal<typeof noTopping, string>>;

    expect(noTopping).toBeUndefined();
  });
});
