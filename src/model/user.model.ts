import { Document } from 'mongoose';
import { Bus } from './bus.model';
import { Base } from './base.model';
import { Category } from './category.model';

export interface User extends Document, Base {
  google_id?: string;
  name?: string;
  email?: string;
  password?: string;
  bus?: Bus[];
  categories: Category[];
  compareHash(user: User): Promise<boolean>
}
