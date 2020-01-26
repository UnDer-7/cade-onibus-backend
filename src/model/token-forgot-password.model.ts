import CryptoUtil from '../util/crypto.util';

export class TokenForgotPassword {
  public readonly payload: PayloadDecoded;
  public readonly iat: Date;
  public readonly exp: Date;
  public readonly tokenEncoded: string;

  constructor(decoded: any, encoded: string) {
    this.iat = new Date(decoded.iat * 1000);
    this.exp = new Date(decoded.exp * 1000);
    this.tokenEncoded = encoded;

    this.payload = JSON.parse(CryptoUtil.decrypt(decoded.payload)) as PayloadDecoded;
  }
}

interface PayloadDecoded {
  email: string;
  id: string;
}
