/**
 * @module
 * @private
 * @internal
 */

import * as symbols from './symbols';
import { SelectionType } from '../types/FindSelected';
import { Pattern, Matcher, MatcherType, AnyMatcher } from '../types/Pattern';

// @internal
export const isObject = (value: unknown): value is Object =>
  Boolean(value && typeof value === 'object');

//   @internal
export const isMatcher = (
  x: unknown
): x is Matcher<unknown, unknown, MatcherType, SelectionType> => {
  const pattern = x as Matcher<unknown, unknown, MatcherType, SelectionType>;
  return pattern && !!pattern[symbols.matcher];
};

// @internal
const isOptionalPattern = (
  x: unknown
): x is Matcher<unknown, unknown, 'optional', SelectionType> => {
  return isMatcher(x) && x[symbols.matcher]().matcherType === 'optional';
};

// tells us if the value matches a given pattern.
// @internal
export const matchPattern = (
  pattern: any,
  value: any,
  select: (key: string, value: unknown) => void,
  onMismatch?: (error: import('../errors').PatternMismatch) => void,
  path: (string | number | symbol)[] = []
): boolean => {
  if (isMatcher(pattern)) {
    const matcher = pattern[symbols.matcher]();
    const { matched, selections } = matcher.match(value);
    if (matched && selections) {
      Object.keys(selections).forEach((key) => select(key, selections[key]));
    }
    if (!matched && onMismatch) {
      onMismatch({
        path,
        expected: pattern,
        actual: value,
        type: 'invalid-value',
      });
    }
    return matched;
  }

  if (isObject(pattern)) {
    if (!isObject(value)) {
      if (onMismatch) {
        onMismatch({
          path,
          expected: pattern,
          actual: value,
          type: 'invalid-value',
        });
      }
      return false;
    }

    // Tuple pattern
    if (Array.isArray(pattern)) {
      if (!Array.isArray(value)) {
        if (onMismatch) {
          onMismatch({
            path,
            expected: pattern,
            actual: value,
            type: 'invalid-value',
          });
        }
        return false;
      }
      let startPatterns = [];
      let endPatterns = [];
      let variadicPatterns: AnyMatcher[] = [];

      for (const i of pattern.keys()) {
        const subpattern = pattern[i];
        if (isMatcher(subpattern) && subpattern[symbols.isVariadic]) {
          variadicPatterns.push(subpattern);
        } else if (variadicPatterns.length) {
          endPatterns.push(subpattern);
        } else {
          startPatterns.push(subpattern);
        }
      }

      if (variadicPatterns.length) {
        if (variadicPatterns.length > 1) {
          throw new Error(
            `Pattern error: Using \`...P.array(...)\` several times in a single pattern is not allowed.`
          );
        }

        if (value.length < startPatterns.length + endPatterns.length) {
          if (onMismatch) {
            onMismatch({
              path,
              expected: pattern,
              actual: value,
              type: 'invalid-value',
            });
          }
          return false;
        }

        const startValues = value.slice(0, startPatterns.length);
        const endValues =
          endPatterns.length === 0 ? [] : value.slice(-endPatterns.length);
        const middleValues = value.slice(
          startPatterns.length,
          endPatterns.length === 0 ? Infinity : -endPatterns.length
        );

        return (
          startPatterns.every((subPattern, i) =>
            matchPattern(subPattern, startValues[i], select, onMismatch, [
              ...path,
              i,
            ])
          ) &&
          endPatterns.every((subPattern, i) =>
            matchPattern(
              subPattern,
              endValues[i],
              select,
              onMismatch,
              [...path, value.length - endPatterns.length + i]
            )
          ) &&
          (variadicPatterns.length === 0
            ? true
            : matchPattern(
                variadicPatterns[0],
                middleValues,
                select,
                onMismatch,
                [...path, startPatterns.length]
              ))
        );
      }

      if (pattern.length !== value.length) {
        if (onMismatch) {
          onMismatch({
            path,
            expected: pattern,
            actual: value,
            type: 'invalid-value',
          });
        }
        return false;
      }

      return pattern.every((subPattern, i) =>
        matchPattern(subPattern, value[i], select, onMismatch, [...path, i])
      );
    }

    return Reflect.ownKeys(pattern).every((k): boolean => {
      const subPattern = pattern[k];

      if (!(k in value)) {
        if (!isOptionalPattern(subPattern)) {
          if (onMismatch) {
            onMismatch({
              path: [...path, k],
              expected: subPattern,
              actual: undefined,
              type: 'missing-property',
            });
          }
          return false;
        }
        return true;
      }

      return matchPattern(
        subPattern,
        (value as any)[k],
        select,
        onMismatch,
        [...path, k]
      );
    });
  }

  const matched = Object.is(value, pattern);
  if (!matched && onMismatch) {
    onMismatch({
      path,
      expected: pattern,
      actual: value,
      type: 'invalid-value',
    });
  }
  return matched;
};

// @internal
export const getSelectionKeys = (pattern: any): string[] => {
  if (isObject(pattern)) {
    if (isMatcher(pattern)) {
      return pattern[symbols.matcher]().getSelectionKeys?.() ?? [];
    }
    if (Array.isArray(pattern)) return flatMap(pattern, getSelectionKeys);
    return flatMap(Object.values(pattern), getSelectionKeys);
  }
  return [];
};

// @internal
export const flatMap = <a, b>(
  xs: readonly a[],
  f: (v: a) => readonly b[]
): b[] => xs.reduce<b[]>((acc, x) => acc.concat(f(x)), []);
