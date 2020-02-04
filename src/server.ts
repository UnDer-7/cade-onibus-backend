import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connect, set } from 'mongoose';
import routes from './routes';
import LOGGER from 'morgan';

class Server {
  public express: express.Application;

  constructor() {
    this.express = express();

    this.database();
    this.middleware();
    this.routes();
  }

  public get origins(): string[] {
    const isDev = process.env.NODE_ENV === 'development';
    const prodURL = ['https://cadeonibus.web.app', 'https://cadeonibus.com.br'];

    if (isDev) {
      return [
        'http://localhost:4200',
        'http://localhost:3000',
        ...prodURL,
      ];
    }

    return prodURL;
  }

  private async database(): Promise<void> {
    try {
      // @ts-ignore
      await connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        dbName: process.env.DB_NAME,
      });
      set('debug', true);
      console.log('Successfully connect to the database');
    } catch (e) {
      console.log('Unable to connect to the database');
      console.trace(e);
    }
  }

  private middleware(): void {
    this.express.use(helmet());
    this.express.use(cors({
      origin: this.origins,
    }));
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(LOGGER('dev'))
  }

  private routes(): void {
    this.express.use(routes)
  }
}

export default new Server();
