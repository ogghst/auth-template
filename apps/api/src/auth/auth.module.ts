import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // 15 minutes as per requirements
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Token]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, GithubStrategy, JwtStrategy],
  exports: [AuthService, TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
