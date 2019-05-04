import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user.model';

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [5, 'Minimum 5 characters'],
  },
  userId: {
    type: String,
  },
  password: {
    type: String,
    trim: true,
    minlength: [5, 'Minimum 5 characters'],
  },
  onibus: {
    type: [Object],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// tslint:disable:only-arrow-functions
// tslint:disable:typedef
UserSchema.pre<User>('save', async function(next) {
  if (!this.isModified('password')) {
    return next;
  }

  this.password = await bcrypt.hash(this.password, 8);
});

UserSchema.methods = {
  compareHash(user: User): Promise<boolean> {
    return bcrypt.compare(user.password, this.password)
  },
};

export default model<User>('User', UserSchema);
