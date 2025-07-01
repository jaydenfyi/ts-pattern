import { MatchedValue, Pattern, UnknownProperties } from './types/Pattern';
import * as P from './patterns';
import { matchPattern } from './internals/helpers';
import { WithDefault } from './types/helpers';

/**
 * This constraint allows using additional properties
 * in object patterns. See "should allow targetting unknown properties"
 * unit test in `is-matching.test.ts`.
 */
type PatternConstraint<T> = T extends readonly any[]
  ? P.Pattern<T>
  : T extends object
  ? P.Pattern<T> & UnknownProperties
  : P.Pattern<T>;

/**
 * `is` takes a value and a pattern and checks if the value matches this pattern.
 */
export function is<const T, const P extends PatternConstraint<T>>(
  value: T,
  pattern: P
): value is T & WithDefault<P.narrow<T, P>, P.infer<P>> {
  return matchPattern(pattern, value, () => {});
}
