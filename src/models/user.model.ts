import { Document } from 'mongoose';
import { Onibus } from './onibus.model';

export interface User extends Document {
  name?: string;
  email?: string;
  userId?: string;
  moedas?: string;
  password?: string;
  onibus?: Onibus[];
}
