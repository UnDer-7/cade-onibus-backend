import 'reflect-metadata';
import { config } from 'dotenv';
config();

import server from './server';

const port = process.env.PORT;

server.express.listen(port, () => {
  console.log('\n----------------------');
  console.log(`URL:             http://localhost:${port}`);
  console.log(`ENVIRONMENT:     ${process.env.NODE_ENV}`);
  console.log(`SERVER VERSION:  ${process.env.npm_package_version}`);
  console.log(`Allowed origins: ${server.origins.join(' | ')}`);
  console.log(`Database URL:    ${process.env.DB_URL}`);
  console.log(`Database Name:   ${process.env.DB_NAME}`);
  console.log('----------------------\n');
});
