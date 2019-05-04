import { Document } from 'mongoose';
import { Onibus } from './onibus.model';
import { Base } from './base.model';

export interface User extends Document, Base {
  name?: string;
  email?: string;
  userId?: string;
  moedas?: string;
  password?: string;
  onibus?: Onibus[];
  compareHash(user: User): Promise<boolean>;
}
