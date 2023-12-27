import { Column, Entity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Photo } from '../photos/photo.entity';

@Entity()
export class Client extends User {
  @Column()
  avatar: string;

  @OneToMany(() => Photo, (photo) => photo.user, { eager: true })
  photos: Photo[];
}
