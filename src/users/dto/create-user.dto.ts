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

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[0-9]).*$/, {
    message: 'password must contain at least 1 number',
  })
  password: string;

  @IsString()
  @Length(2, 25)
  firstName: string;

  @IsString()
  @Length(2, 25)
  lastName: string;

  @IsString()
  role: string;

  active: boolean;

  avatar: multer.Multer.File;

  @IsArray()
  @ArrayNotEmpty()
  photos: multer.Multer.File[];
}
