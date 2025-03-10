import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // This route initiates GitHub OAuth flow
    // The guard handles the redirect to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    // After GitHub authentication, create user if needed and generate tokens
    const user = req.user as any;
    const isNewUser = await this.authService.handleGithubUser(user);

    // Generate access and refresh tokens
    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user.id);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Redirect based on whether this is a new user or returning user
    if (isNewUser) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/onboarding?token=${accessToken}`,
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard?token=${accessToken}`,
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.tokenService.refreshTokens(refreshToken);

      // Update refresh token cookie
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(HttpStatus.OK).json({
        accessToken,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    // Invalidate the refresh token
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }

    // Clear the cookie
    res.clearCookie('refresh_token');

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<AuthResponseDto> {
    // TypeScript doesn't know about the user property that Passport adds
    const user = req.user as any;
    return this.authService.getUserProfile(user.id);
  }
}
