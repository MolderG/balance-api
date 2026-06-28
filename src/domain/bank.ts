export interface Account {
  id: string;
  balance: number;
}

export interface TransferResult {
  origin: Account;
  destination: Account;
}

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

  withdraw(origin: string, amount: number): Account | undefined {
    const current = this.balances.get(origin);
    if (current === undefined) return undefined;
    const balance = current - amount;
    this.balances.set(origin, balance);
    return { id: origin, balance };
  }

  transfer(origin: string, destination: string, amount: number): TransferResult | undefined {
    const from = this.withdraw(origin, amount);
    if (from === undefined) return undefined;
    const to = this.deposit(destination, amount);
    return { origin: from, destination: to };
  }
}
