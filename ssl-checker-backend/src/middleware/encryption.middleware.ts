import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from 'src/services/encryption.service';

@Injectable()
export class EncryptionMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const encryptionService = new EncryptionService();

        // if (req.body.username) req.body.username = encryptionService.encrypt(req.body.username);
        // if (req.body.hostname) req.body.hostname = encryptionService.encrypt(req.body.hostname);
        // if (req.body.password) req.body.password = encryptionService.encrypt(req.body.password);
        next();
    }
}
