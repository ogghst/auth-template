import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import axios, { AxiosError } from 'axios';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async handleGithubUser(githubUser: any): Promise<boolean> {
    // Check if user exists
    let user = await this.userRepository.findOneBy({ githubId: githubUser.id });
    const isNewUser = !user;

    if (isNewUser) {
      // Create new user if doesn't exist
      user = this.userRepository.create({
        githubId: githubUser.id,
        name: githubUser.displayName || githubUser.username,
        username: githubUser.username,
        email: githubUser.email,
        displayName: githubUser.displayName,
        avatarUrl: githubUser.avatar_url,
        githubProfileUrl: githubUser.html_url,
      });
    } else {
      // Update existing user with latest data
      user.username = githubUser.username;
      user.email = githubUser.email;
      user.displayName = githubUser.displayName;
      user.avatarUrl = githubUser.avatar_url;
      user.githubProfileUrl = githubUser.html_url;
    }

    await this.userRepository.save(user);
    return isNewUser;
  }

  /**
   * Retrieves a user by their GitHub ID
   * @param githubId The GitHub user ID
   * @returns The user entity
   */
  async getUserByGithubId(githubId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ githubId });
    if (!user) {
      throw new NotFoundException(`User with GitHub ID ${githubId} not found`);
    }
    return user;
  }

  async getUserProfile(userId: string): Promise<AuthResponseDto> {
    const user = await this.validateUserById(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      githubProfileUrl: user.githubProfileUrl,
    };
  }

  async validateUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Enhanced method for the PKCE flow
  async exchangeGithubCode(
    code: string,
    codeVerifier: string,
  ): Promise<{ accessToken: string; userData: any }> {
    try {
      console.log('Exchanging code for GitHub token with PKCE...');
      console.log(`Code verifier length: ${codeVerifier?.length}`);
      console.log(`Authorization code length: ${code?.length}`);

      // Prepare the request data
      const tokenRequestData = {
        client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
        client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
        code,
        code_verifier: codeVerifier,
        // Don't include redirect_uri unless it's explicitly required by GitHub
        // and matches exactly what was used in the authorization request
      };

      console.log(
        'Token request data:',
        JSON.stringify({
          client_id: tokenRequestData.client_id,
          code_length: code?.length || 0,
          code_verifier_length: codeVerifier?.length || 0,
        }),
      );

      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        tokenRequestData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('GitHub token response status:', tokenResponse.status);

      // For debugging purposes, log a safe version of the response
      if (tokenResponse.data) {
        console.log(
          'GitHub token response data keys:',
          Object.keys(tokenResponse.data),
        );
        console.log('Has access_token?', !!tokenResponse.data.access_token);
        console.log('Has error?', !!tokenResponse.data.error);
        if (tokenResponse.data.error) {
          console.log('GitHub error:', tokenResponse.data.error);
          console.log(
            'GitHub error description:',
            tokenResponse.data.error_description,
          );
        }
      }

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new UnauthorizedException(
          `Failed to obtain access token: ${tokenResponse.data.error_description || 'No access token returned'}`,
        );
      }

      console.log('Successfully obtained GitHub access token');

      // Get the user data from GitHub API
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });

      // Get user's emails
      const emailsResponse = await axios.get(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `token ${access_token}`,
          },
        },
      );

      const githubUser = userResponse.data;
      const emails = emailsResponse.data;

      // Find the primary email
      const primaryEmail =
        emails.find((email: any) => email.primary)?.email || emails[0]?.email;

      console.log('Retrieved GitHub user data successfully');

      // Format the user data
      const userData = {
        id: githubUser.id.toString(),
        username: githubUser.login,
        displayName: githubUser.name,
        email: primaryEmail,
        avatar_url: githubUser.avatar_url,
        html_url: githubUser.html_url,
      };

      return {
        accessToken: access_token,
        userData,
      };
    } catch (error) {
      // Enhanced error handling
      const axiosError = error as AxiosError;

      console.error('GitHub API error details:');
      console.error('- Status:', axiosError.response?.status);
      console.error('- Status text:', axiosError.response?.statusText);
      console.error(
        '- Response data:',
        JSON.stringify(axiosError.response?.data || {}),
      );
      console.error('- Error message:', axiosError.message);

      if (axiosError.request && !axiosError.response) {
        console.error(
          'No response received from GitHub API - possible network issue',
        );
      }

      throw new UnauthorizedException('Failed to authenticate with GitHub');
    }
  }
}
