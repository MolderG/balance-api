import { Bank } from './domain/bank';
import { createApp } from './http/app';

const bank = new Bank();
const app = createApp(bank);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`listening on :${port}`);
});
