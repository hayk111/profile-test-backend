import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { omit, startCase, toLower } from 'lodash';
import { v4 as uuid } from 'uuid';

import { Client as ClientEntity } from './client.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PhotosRepository } from '../photos/photos.repository';
import { Photo } from '../photos/photo.entity';
import { UpdateAvatarDto } from '../users/dto/update-avatar.dto';

@Injectable()
export class UsersRepository extends Repository<ClientEntity> {
  private s3: AWS.S3;

  constructor(
    private dataSource: DataSource,
    @InjectRepository(PhotosRepository)
    private photosRepository: PhotosRepository,
  ) {
    super(ClientEntity, dataSource.createEntityManager());

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { password, firstName, lastName, avatar, photos } = createUserDto;

    if (photos?.length < 4) {
      throw new BadRequestException('You must upload at least 4 photos');
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = this.create({
      ...omit(createUserDto, 'password', 'firstName', 'lastName'),
      fullName: startCase(toLower(`${firstName} ${lastName}`)),
      password: hashedPassword,
    }) as unknown as ClientEntity;

    try {
      if (avatar) {
        const s3Key = `photos/${uuid()}-${avatar.name}`;
        await this.uploadToS3(
          Buffer.from(avatar.base64Data, 'base64'),
          s3Key,
          avatar.type,
        );

        user.avatar = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
      }

      await this.save(user);

      const photoEntities: Photo[] = [];

      for (const photo of photos) {
        const s3Key = `photos/${uuid()}-${photo.name}`;
        await this.uploadToS3(
          Buffer.from(photo.base64Data, 'base64'),
          s3Key,
          photo.type,
        );

        const photoEntity = this.photosRepository.create({
          name: photo.name ?? uuid(),
          url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
          user: user.id,
        });

        await this.photosRepository.save(photoEntity);
        photoEntities.push(photoEntity);
      }
    } catch (error) {
      console.log('error:', error);
      if (error.code === '23505') {
        // duplicate email exception
        throw new ConflictException('email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateAvatar(
    userId: string,
    updateAvatarDto: UpdateAvatarDto,
  ): Promise<string> {
    const foundUser = await this.findOneBy({ id: userId });
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }

    const { avatar } = updateAvatarDto;
    const s3Key = `photos/${uuid()}-${avatar.name}`;
    await this.uploadToS3(
      Buffer.from(avatar.base64Data, 'base64'),
      s3Key,
      avatar.type,
    );

    const newAvatar = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`;
    foundUser.avatar = newAvatar;
    await this.save(foundUser);

    return newAvatar;
  }

  // An S3 client function to upload the buffer with the specified key
  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType = 'image/jpeg',
  ): Promise<void> {
    await this.s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType, // Specifies the mime type of the file
        ACL: 'public-read',
      })
      .promise();
  }
}
