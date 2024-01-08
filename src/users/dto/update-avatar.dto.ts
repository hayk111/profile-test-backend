import { IsNotEmptyObject } from 'class-validator';
import * as multer from 'multer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvatarDto {
  @IsNotEmptyObject()
  @ApiProperty({ description: "User's profile avatar" })
  avatar: multer.Multer.File;
}
