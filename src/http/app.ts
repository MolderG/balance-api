import express, { Express, Request, Response } from 'express';
import { Bank } from '../domain/bank';

export function createApp(bank: Bank): Express {
  const app = express();
  app.use(express.json());

  app.post('/reset', (_req: Request, res: Response) => {
    bank.reset();
    res.status(200).send('OK');
  });

  app.get('/balance', (req: Request, res: Response) => {
    const balance = bank.balanceOf(String(req.query.account_id));
    if (balance === undefined) {
      res.status(404).json(0);
      return;
    }
    res.status(200).json(balance);
  });

  app.post('/event', (req: Request, res: Response) => {
    const { type, origin, destination, amount } = req.body;

    switch (type) {
      case 'deposit': {
        const account = bank.deposit(String(destination), Number(amount));
        res.status(201).json({ destination: account });
        return;
      }
      case 'withdraw': {
        const result = bank.withdraw(String(origin), Number(amount));
        if (result.status === 'account_not_found') {
          res.status(404).json(0);
          return;
        }
        if (result.status === 'insufficient_funds') {
          res.status(422).json({ error: 'insufficient_funds' });
          return;
        }
        res.status(201).json({ origin: result.account });
        return;
      }
      case 'transfer': {
        const result = bank.transfer(String(origin), String(destination), Number(amount));
        if (result.status === 'account_not_found') {
          res.status(404).json(0);
          return;
        }
        if (result.status === 'insufficient_funds') {
          res.status(422).json({ error: 'insufficient_funds' });
          return;
        }
        res.status(201).json({ origin: result.origin, destination: result.destination });
        return;
      }
      default:
        res.status(400).send();
    }
  });

  return app;
}
