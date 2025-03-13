import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { ExchangeCodeDto } from '../dtos/exchange-code.dto';
import { ExchangeTokenDto } from '../dtos/exchange-token.dto';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    console.log('[GitHub Auth] Initiating OAuth flow');
    // The guard handles the redirect to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    console.log(`[GitHub Callback] Received callback from GitHub`);
    const user = req.user as any;
    console.log(`[GitHub Callback] Processing user: ${user?.id || 'unknown'}`);

    const isNewUser = await this.authService.handleGithubUser(user);
    console.log(`[GitHub Callback] User ${isNewUser ? 'created' : 'updated'}`);

    // Get the user by GitHub ID to retrieve the internal UUID
    const dbUser = await this.authService.getUserByGithubId(user.id);
    console.log(`[GitHub Callback] Retrieved user with UUID: ${dbUser.id}`);

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(dbUser.id);
    console.log(`[GitHub Callback] Tokens generated for: ${dbUser.id}`);

    // Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Set access token in HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    console.log(
      `[GitHub Callback] Redirecting to ${isNewUser ? 'onboarding' : 'dashboard'}`,
    );
    return res.redirect(
      `${process.env.FRONTEND_URL}/${isNewUser ? 'onboarding' : 'dashboard'}?token=${accessToken}`,
    );
  }

  @Post('exchange-code')
  async exchangeCode(
    @Body() exchangeCodeDto: ExchangeCodeDto,
    @Res() res: Response,
  ) {
    console.log('[Code Exchange] Starting code exchange');
    try {
      const { accessToken: githubToken, userData } =
        await this.authService.exchangeGithubCode(
          exchangeCodeDto.code,
          exchangeCodeDto.code_verifier,
        );
      console.log('[Code Exchange] GitHub tokens received');

      const isNewUser = await this.authService.handleGithubUser({
        ...userData,
        accessToken: githubToken,
      });
      console.log(
        `[Code Exchange] User ${userData.id} ${isNewUser ? 'created' : 'updated'}`,
      );

      // Get the user by GitHub ID to retrieve the internal UUID
      const dbUser = await this.authService.getUserByGithubId(userData.id);
      console.log(`[Code Exchange] Retrieved user with UUID: ${dbUser.id}`);

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(dbUser.id);
      console.log('[Code Exchange] Application tokens generated');

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Set access token in HTTP-only cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      console.log('[Code Exchange] Successfully completed');
      return res.status(HttpStatus.OK).json({
        accessToken, // Still include in response for clients that need it
        isNewUser,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.displayName,
          image: userData.avatar_url,
        },
      });
    } catch (error: any) {
      console.error('[Code Exchange] Error:', error.message);
      console.error('[Code Exchange] Stack:', error.stack);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    console.log('[Token Refresh] Refresh attempt started');
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      console.warn('[Token Refresh] No refresh token found');
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.tokenService.refreshTokens(refreshToken);
      console.log('[Token Refresh] Tokens refreshed successfully');

      // Update refresh token cookie
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Update access token cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      console.log('[Token Refresh] Cookies updated');
      return res.status(HttpStatus.OK).json({
        accessToken,
      });
    } catch (error: any) {
      console.error('[Token Refresh] Error:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    console.log(`[Logout] User ${user?.id} logging out`);

    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      console.log(`[Logout] Revoking refresh token for ${user?.id}`);
      await this.tokenService.revokeRefreshToken(refreshToken);
    }

    console.log('[Logout] Clearing auth cookies');
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<AuthResponseDto> {
    const user = req.user as any;
    console.log(`[Profile] Fetching profile for ${user?.id}`);
    return this.authService.getUserProfile(user.id);
  }

  @Post('exchange-token')
  async exchangeToken(
    @Body() exchangeTokenDto: ExchangeTokenDto,
    @Res() res: Response,
  ) {
    console.log('[Token Exchange] Starting token exchange');
    try {
      if (exchangeTokenDto.provider !== 'github') {
        throw new UnauthorizedException(
          `Unsupported provider: ${exchangeTokenDto.provider}`,
        );
      }

      // Get user data from GitHub using the provided token
      console.log('[Token Exchange] Getting user data from GitHub');
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${exchangeTokenDto.access_token}`,
        },
      });

      // Get user's emails
      const emailsResponse = await axios.get(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `token ${exchangeTokenDto.access_token}`,
          },
        },
      );

      const githubUser = userResponse.data;
      const emails = emailsResponse.data;

      // Find the primary email
      const primaryEmail =
        emails.find((email: any) => email.primary)?.email || emails[0]?.email;

      // Format the user data
      const userData = {
        id: githubUser.id.toString(),
        username: githubUser.login,
        displayName: githubUser.name,
        email: primaryEmail,
        avatar_url: githubUser.avatar_url,
        html_url: githubUser.html_url,
        accessToken: exchangeTokenDto.access_token,
      };

      console.log(`[Token Exchange] User data retrieved for: ${userData.id}`);

      // Create or update the user
      const isNewUser = await this.authService.handleGithubUser(userData);
      console.log(`[Token Exchange] User ${isNewUser ? 'created' : 'updated'}`);

      // Get the user by GitHub ID to retrieve the internal UUID
      const dbUser = await this.authService.getUserByGithubId(userData.id);
      console.log(`[Token Exchange] Retrieved user with UUID: ${dbUser.id}`);

      // Generate access and refresh tokens using the internal UUID
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokens(dbUser.id);
      console.log('[Token Exchange] Application tokens generated');

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Set access token in HTTP-only cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      console.log('[Token Exchange] Successfully completed');
      return res.status(HttpStatus.OK).json({
        accessToken,
        isNewUser,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.displayName,
          image: userData.avatar_url,
        },
      });
    } catch (error: any) {
      console.error('[Token Exchange] Error:', error.message);
      console.error('[Token Exchange] Stack:', error.stack);
      throw new UnauthorizedException('Failed to exchange token');
    }
  }
}
