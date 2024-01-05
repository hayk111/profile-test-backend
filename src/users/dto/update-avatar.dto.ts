import { IsNotEmptyObject } from 'class-validator';
import * as multer from 'multer';

export class UpdateAvatarDto {
  @IsNotEmptyObject()
  avatar: multer.Multer.File;
}
