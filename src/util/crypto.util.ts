// tslint:disable-next-line:no-var-requires
const CRYPTR = require('cryptr');

export default class CryptoUtil {
  // tslint:disable-next-line:typedef
  private static readonly crypto = new CRYPTR(process.env.ENCRYPT_SECRET);

  private constructor() {}

  public static encrypt(value: string): string {
    return this.crypto.encrypt(value)
  }

  public static decrypt(value: string): string {
    return this.crypto.decrypt(value);
  }
}
