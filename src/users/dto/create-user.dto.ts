import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsString,
  Length,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import * as multer from 'multer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ description: "User's email" })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[0-9]).*$/, {
    message: 'password must contain at least 1 number',
  })
  @ApiProperty({ description: "User's password" })
  password: string;

  @IsString()
  @Length(2, 25)
  @ApiProperty({ description: "User's first name" })
  firstName: string;

  @IsString()
  @Length(2, 25)
  @ApiProperty({ description: "User's last name" })
  lastName: string;

  @IsString()
  @ApiProperty({ description: "User's role" })
  role: string;

  @ApiProperty({ description: 'Is user active?' })
  active: boolean;

  @ApiProperty({ description: "User's profile avatar" })
  avatar: multer.Multer.File;

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({ description: "User's photos" })
  photos: multer.Multer.File[];
}
