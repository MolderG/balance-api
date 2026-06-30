import { describe, it, expect, beforeEach } from 'vitest';
import { Bank } from '../src/domain/bank';

describe('Bank', () => {
  let bank: Bank;

  beforeEach(() => {
    bank = new Bank();
  });

  it('has no balance for an unknown account', () => {
    expect(bank.balanceOf('1234')).toBeUndefined();
  });

  it('creates an account on first deposit and persists it', () => {
    expect(bank.deposit('100', 10)).toEqual({ id: '100', balance: 10 });
    expect(bank.balanceOf('100')).toBe(10);
  });

  it('accumulates deposits in the store', () => {
    bank.deposit('100', 10);
    bank.deposit('100', 10);
    expect(bank.balanceOf('100')).toBe(20);
  });

  it('withdraws from an existing account and persists the new balance', () => {
    bank.deposit('100', 20);
    expect(bank.withdraw('100', 5)).toEqual({ status: 'ok', account: { id: '100', balance: 15 } });
    expect(bank.balanceOf('100')).toBe(15);
  });

  it('does not withdraw from an unknown account', () => {
    expect(bank.withdraw('200', 10)).toEqual({ status: 'account_not_found' });
  });

  it('rejects a withdrawal with insufficient funds and leaves the balance unchanged', () => {
    bank.deposit('100', 5);
    expect(bank.withdraw('100', 10)).toEqual({ status: 'insufficient_funds' });
    expect(bank.balanceOf('100')).toBe(5);
  });

  it('transfers between accounts, updating both sides', () => {
    bank.deposit('100', 15);
    expect(bank.transfer('100', '300', 15)).toEqual({
      status: 'ok',
      origin: { id: '100', balance: 0 },
      destination: { id: '300', balance: 15 },
    });
    expect(bank.balanceOf('100')).toBe(0);
    expect(bank.balanceOf('300')).toBe(15);
  });

  it('does not transfer from an unknown origin', () => {
    expect(bank.transfer('200', '300', 15)).toEqual({ status: 'account_not_found' });
  });

  it('rejects a transfer with insufficient funds and leaves both accounts untouched', () => {
    bank.deposit('100', 5);
    expect(bank.transfer('100', '300', 15)).toEqual({ status: 'insufficient_funds' });
    expect(bank.balanceOf('100')).toBe(5);
    expect(bank.balanceOf('300')).toBeUndefined();
  });

  it('clears all state on reset', () => {
    bank.deposit('100', 10);
    bank.reset();
    expect(bank.balanceOf('100')).toBeUndefined();
  });

  it('handles a full deposit -> withdraw -> transfer flow', () => {
    bank.deposit('A', 100);
    bank.withdraw('A', 30); // A: 70
    bank.transfer('A', 'B', 50); // A: 20, B: 50
    expect(bank.balanceOf('A')).toBe(20);
    expect(bank.balanceOf('B')).toBe(50);
  });
});
