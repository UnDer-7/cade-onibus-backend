import { isEquals } from '../util/equals';
import { Messages } from '../util/messages.util';

export interface Token {
  email?: string;
  iat?: number;
  exp?: number;
}

export function objectToToken(token: any): Token {
  if (canAssign(token)) {
    throw new Error(Messages.ASSIGN_ERROR)
  }

  return Object.assign({}, {
    email: token.email,
    iat: token.iat,
    exp: token.exp,
  })
}

function canAssign(obj: any): boolean {
  const token = {
    email: null,
    iat: null,
    exp: null,
  };
  return !isEquals(obj, token);
}
