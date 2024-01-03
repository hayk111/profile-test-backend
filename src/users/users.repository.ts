import {
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
import * as multer from 'multer';
import { Client as ClientEntity } from './client.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PhotosRepository } from '../photos/photos.repository';
import { Photo } from '../photos/photo.entity';

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

  async createUser(
    createUserDto: CreateUserDto,
    photos: multer.Multer.File[],
  ): Promise<void> {
    const { password, firstName, lastName } = createUserDto;

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = this.create({
      ...omit(createUserDto, 'password', 'firstName', 'lastName'),
      fullName: startCase(toLower(`${firstName} ${lastName}`)),
      password: hashedPassword,
    }) as unknown as ClientEntity;

    try {
      await this.save(user);

      // Upload photos to S3 if any provided
      if (photos && photos.length > 0) {
        const photoEntities: Photo[] = [];

        for (const photo of photos) {
          const s3Key = `photos/${uuid()}-${photo.name}`;
          await this.uploadToS3(
            Buffer.from(photo.base64Data, 'base64'),
            s3Key,
            photo.type,
          );

          const photoEntity = this.photosRepository.create({
            name: photo.name,
            url: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
            user: user.id,
          });

          await this.photosRepository.save(photoEntity);
          photoEntities.push(photoEntity);
        }
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
