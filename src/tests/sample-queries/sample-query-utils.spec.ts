import { isJsonString } from '../../app/views/sidebar/sample-queries/sample-query-utils';

describe('Tests isJsonString', () => {
  it('Returns true for valid JSON strings', () => {
    expect(isJsonString('{"foo": "bar"}')).toBe(true);
  });

  it('Returns false for invalid JSON strings', () => {
    expect(isJsonString('{"foo": "bar"')).toBe(false);
  })
})