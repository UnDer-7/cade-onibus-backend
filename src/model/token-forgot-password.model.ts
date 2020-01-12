import CryptoUtil from '../util/crypto.util';

export class TokenForgotPassword {
  public readonly payload: PayloadDecoded;
  public readonly iat: Date;
  public readonly exp: Date;

  constructor(token: any) {
    this.iat = new Date(token.iat * 1000);
    this.exp = new Date(token.exp * 1000);

    this.payload = JSON.parse(CryptoUtil.decrypt(token.payload)) as PayloadDecoded;
  }
}

interface PayloadDecoded {
  email: string;
  id: string;
}
