import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user.model';

// tslint:disable-next-line:variable-name
const UserSchema: Schema = new Schema({
  google_id: {
    type: String,
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
    minlength: [5, 'Minimum 5 characters'],
  },
  bus: {
    type: [Object],
  },
  categories: [
    {
      _id: false,
      title: {
        type: String,
        unique: true,
        required: true,
        trim: true,
      },
      cardColor: {
        type: Number,
        required: true,
      },
      uuid: {
        type: Schema.Types.String,
        required: true,
      },
      buses: [Schema.Types.Mixed],
    },
  ],
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
