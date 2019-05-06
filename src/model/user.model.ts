import { Document } from 'mongoose';
import { Bus } from './bus.model';
import { Base } from './base.model';

export interface User extends Document, Base {
  google_id?: string;
  name?: string;
  email?: string;
  password?: string;
  onibus?: Bus[];
  compareHash(user: User): Promise<boolean>
}
