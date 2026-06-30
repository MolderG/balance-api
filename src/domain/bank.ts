export interface Account {
  id: string;
  balance: number;
}

export type WithdrawResult =
  | { status: 'ok'; account: Account }
  | { status: 'account_not_found' }
  | { status: 'insufficient_funds' };

export type TransferResult =
  | { status: 'ok'; origin: Account; destination: Account }
  | { status: 'account_not_found' }
  | { status: 'insufficient_funds' };

export class Bank {
  private readonly balances = new Map<string, number>();

  reset(): void {
    this.balances.clear();
  }

  balanceOf(id: string): number | undefined {
    return this.balances.get(id);
  }

  deposit(destination: string, amount: number): Account {
    const balance = (this.balances.get(destination) ?? 0) + amount;
    this.balances.set(destination, balance);
    return { id: destination, balance };
  }

  withdraw(origin: string, amount: number): WithdrawResult {
    const current = this.balances.get(origin);
    if (current === undefined) return { status: 'account_not_found' };
    if (current < amount) return { status: 'insufficient_funds' };
    const balance = current - amount;
    this.balances.set(origin, balance);
    return { status: 'ok', account: { id: origin, balance } };
  }

  transfer(origin: string, destination: string, amount: number): TransferResult {
    const withdrawn = this.withdraw(origin, amount);
    if (withdrawn.status !== 'ok') return withdrawn;
    const credited = this.deposit(destination, amount);
    return { status: 'ok', origin: withdrawn.account, destination: credited };
  }
}
