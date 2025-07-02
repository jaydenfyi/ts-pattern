import * as Pattern from './patterns';
import { matchPattern } from './internals/helpers';
import { Equal } from './types/helpers';

// Utility type that collects keys where the pattern explicitly contains
// `undefined` even though the value type does not.
type BadUndefinedKeys<V, P> = {
  [K in keyof P & keyof V]: Equal<P[K], undefined> extends true
    ? (undefined extends V[K] ? never : K)
    : P[K] extends object
    ? BadUndefinedKeys<V[K], P[K]>
    : never;
}[keyof P & keyof V];

// Reject patterns that explicitly use `undefined` where it is not allowed.
type NoExplicitUndefined<V, P> = BadUndefinedKeys<V, P> extends never ? P : never;

/**
 * `isStricter` behaves like `isStrict` but additionally rejects patterns
 * containing explicit `undefined` values for properties that are not
 * optional in the value's type.
 */
export function isStricter<const T, const P extends Pattern.Pattern<T>>(
  value: T,
  pattern: NoExplicitUndefined<T, P>
): value is Pattern.infer<P> {
  return matchPattern(pattern, value, () => {});
}
