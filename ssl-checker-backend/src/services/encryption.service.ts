import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  // Use strong key & IV (store these securely, like in env variables)
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey = crypto
    .createHash('sha256')
    .update(String(process.env.ENCRYPTION_SECRET || 'my-secret-key'))
    .digest('base64')
    .substr(0, 32); // 32 bytes for AES-256

  private readonly iv = Buffer.from(process.env.ENCRYPTION_IV || '1234567890123456'); // 16 bytes

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  

  decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}
