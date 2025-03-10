import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    // Extract the email from the profile emails array
    const email = profile.emails && profile.emails[0]?.value;

    const user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      email: email,
      avatar_url: profile._json.avatar_url,
      html_url: profile._json.html_url,
      accessToken,
    };

    return done(null, user);
  }
}
