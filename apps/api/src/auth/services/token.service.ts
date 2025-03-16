import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Token } from '@/entities/token.entity';
import { TokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Create a unique jti (JWT ID) for the refresh token
    const jti = uuidv4();

    // Generate access token
    const payload: TokenPayload = {
      sub: userId,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token with longer expiration
    const refreshToken = this.jwtService.sign(
      { ...payload, jti },
      { expiresIn: '30d' }, // 30 days
    );

    // Save refresh token to database
    const tokenEntity = this.tokenRepository.create({
      jti,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      // Save metadata like IP, user agent, etc.
      metadata: {
        createdAt: new Date(),
      },
    });

    await this.tokenRepository.save(tokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Check if token exists in the database and is not revoked
      const tokenEntity = await this.tokenRepository.findOne({
        where: {
          jti: payload.jti,
          revoked: false,
        },
      });

      if (!tokenEntity) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (tokenEntity.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Revoke the old refresh token
      await this.revokeRefreshToken(refreshToken);

      // Generate new tokens
      return this.generateTokens(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      await this.tokenRepository.update(
        { jti: payload.jti },
        { revoked: true, revokedAt: new Date() },
      );
    } catch (error) {
      // Token is invalid or already expired, nothing to do
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
