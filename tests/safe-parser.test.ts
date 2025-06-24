import { createSafeParser, P } from '../src';

describe('createSafeParser', () => {
  it('should return success when value matches', () => {
    const parse = createSafeParser({ type: 'blogpost', title: P.string });
    const value = { type: 'blogpost', title: 'Hello' };
    expect(parse(value)).toEqual({ success: true, data: value });
  });

  it('should return error with path to mismatch', () => {
    const parse = createSafeParser({ user: { name: P.string } });
    const result = parse({ user: { name: 42 } });
    expect(result.success).toBe(false);
    expect(result.error.path).toEqual(['user', 'name']);
  });
});
