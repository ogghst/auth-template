import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
      expandVariables: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: path.join(process.cwd(), 'db', 'app-database.sqlite'),
      entities: [User, Token],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
