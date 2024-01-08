import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @ApiProperty({ description: "User's email" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: "User's password" })
  password: string;
}
