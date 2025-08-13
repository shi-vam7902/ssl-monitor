import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

import { ENV } from "src/config";
import { ErrorMessages } from "src/constants/messages";
import { IS_PUBLIC_KEY } from "src/middleware/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ErrorMessages.TOKEN_NOT_FOUND);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: ENV.JWT_SECRET,
      });

      // For MongoDB/JWT implementation, we don't store tokens in database
      // Token validation is handled by JWT verification above
      request["user"] = payload;
      request["token"] = token;

      return true;
    } catch (error) {
      if (error && error.name === "TokenExpiredError") {
        throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED);
      } else if (error && error.name === "JsonWebTokenError") {
        throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers["authorization"]?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
