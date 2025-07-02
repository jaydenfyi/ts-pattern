import * as Pattern from './patterns';
import { matchPattern } from './internals/helpers';

/**
 * `isStrict` takes a value and a pattern and checks if the value strictly matches the pattern.
 * At the type level the pattern must be assignable to the value's type.
 */
export function isStrict<const T, const P extends Pattern.Pattern<T>>(
  value: T,
  pattern: P
): value is Pattern.infer<P> {
  return matchPattern(pattern, value, () => {});
}
