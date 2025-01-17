import { IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  siweMessage: string;

  @IsString()
  signature: string;
}