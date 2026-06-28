import { describe, it, expect, beforeEach } from 'vitest';
import { Bank } from '../src/domain/bank';

describe('Bank', () => {
  let bank: Bank;

  beforeEach(() => {
    bank = new Bank();
  });

  it('returns undefined balance for an unknown account', () => {
    expect(bank.balanceOf('1234')).toBeUndefined();
  });

  it('creates an account on first deposit', () => {
    expect(bank.deposit('100', 10)).toEqual({ id: '100', balance: 10 });
  });

  it('accumulates deposits', () => {
    bank.deposit('100', 10);
    expect(bank.deposit('100', 10)).toEqual({ id: '100', balance: 20 });
    expect(bank.balanceOf('100')).toBe(20);
  });

  it('does not withdraw from an unknown account', () => {
    expect(bank.withdraw('200', 10)).toBeUndefined();
  });

  it('withdraws from an existing account', () => {
    bank.deposit('100', 20);
    expect(bank.withdraw('100', 5)).toEqual({ id: '100', balance: 15 });
  });

  it('does not transfer from an unknown origin', () => {
    expect(bank.transfer('200', '300', 15)).toBeUndefined();
  });

  it('transfers between accounts, creating the destination', () => {
    bank.deposit('100', 15);
    expect(bank.transfer('100', '300', 15)).toEqual({
      origin: { id: '100', balance: 0 },
      destination: { id: '300', balance: 15 },
    });
  });

  it('clears all state on reset', () => {
    bank.deposit('100', 10);
    bank.reset();
    expect(bank.balanceOf('100')).toBeUndefined();
  });
});
