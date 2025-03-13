import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { Request } from 'express';

// Create a custom extractor that tries multiple methods
const fromAuthHeaderAsBearerTokenOrCookie = (req: Request) => {
  // First try to get the token from the Authorization header
  let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

  // If not found, try to get it from a cookie
  if (!token && req.cookies) {
    token = req.cookies['access_token'];
  }

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: fromAuthHeaderAsBearerTokenOrCookie,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email, username: user.username };
  }
}
