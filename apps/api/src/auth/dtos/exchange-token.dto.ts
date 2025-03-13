import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class ExchangeTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['github'])
  provider: string;

  @IsString()
  @IsNotEmpty()
  access_token: string;
}
