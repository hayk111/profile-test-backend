import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Photo as PhotoEntity } from './photo.entity';

@Injectable()
export class PhotosRepository extends Repository<PhotoEntity> {
  constructor(private dataSource: DataSource) {
    super(PhotoEntity, dataSource.createEntityManager());
  }
}
