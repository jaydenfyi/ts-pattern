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
});
