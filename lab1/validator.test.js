const { isValidPassword } = require('./validator');

describe('isValidPassword', () => {

  test('valid password returns true and empty reason', () => {
    const result = isValidPassword('Secure1Password');
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });

  test('7-char password fails — too short', () => {
    const result = isValidPassword('Short1A');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Too short (min 8 characters)');
  });

  test('no uppercase fails', () => {
    const result = isValidPassword('nouppercase1');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Must contain an uppercase letter');
  });

  test('no number fails', () => {
    const result = isValidPassword('NoNumbers');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Must contain a number');
  });

  test('number input fails — wrong type', () => {
    const result = isValidPassword(12345678);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Password must be a string');
  });

  test('null fails — wrong type', () => {
    const result = isValidPassword(null);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Password must be a string');
  });

  test('undefined fails — wrong type', () => {
    const result = isValidPassword(undefined);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Password must be a string');
  });

  test('exactly 8 chars is valid', () => {
    const result = isValidPassword('Abcdef1g');
    expect(result.valid).toBe(true);
    expect(result.reason).toBe('');
  });

  test('empty string fails — too short', () => {
    const result = isValidPassword('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Too short (min 8 characters)');
  });

  test('1000-char password passes — no max length check', () => {
    const result = isValidPassword('A1' + 'a'.repeat(998));
    expect(result.valid).toBe(true);
  });

  test('8 spaces fails — no uppercase or number', () => {
    const result = isValidPassword('        ');
    expect(result.valid).toBe(false);
  });

});