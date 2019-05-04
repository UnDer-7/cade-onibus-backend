import 'reflect-metadata';
import { config } from 'dotenv';
config();

import server from './server';

const port = process.env.PORT;

server.listen(port, () => {
  console.log('\n----------------------');
  console.log(`SERVER RUNNING ON\nhttp://localhost:${port}`);
  console.log('----------------------\n');
});
