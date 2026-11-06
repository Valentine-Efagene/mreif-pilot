import crypto from 'crypto';

export default class SmilerUtil {
  public static generateSignature = (
    signatureApiKey: string,
    partnerId: string,
    timestamp: string,
  ) => {
    const api_key = signatureApiKey;
    const partner_id = partnerId;
    const hmac = crypto.createHmac('sha256', api_key);

    hmac.update(timestamp, 'utf8');
    hmac.update(partner_id, 'utf8');
    hmac.update('sid_request', 'utf8');

    const signature = hmac.digest().toString('base64');
    return signature;
  };
}
