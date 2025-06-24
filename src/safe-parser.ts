import { matchPattern } from './internals/helpers';
import type { Pattern } from './types/Pattern';
import type { PatternMismatch } from './errors';

export function createSafeParser<P extends Pattern<any>>(pattern: P) {
  return (value: unknown) => {
    let error: PatternMismatch | undefined;
    const matched = matchPattern(pattern, value, () => {}, (e) => {
      error = e;
    });
    return matched
      ? { success: true as const, data: value as import('./patterns').infer<P> }
      : { success: false as const, error: error! };
  };
}
