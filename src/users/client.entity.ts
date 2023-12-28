import { Column, Entity, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Photo } from '../photos/photo.entity';
import { defaultAvatar } from '../values';

@Entity('user')
export class Client extends User {
  @Column({
    default: defaultAvatar,
  })
  avatar: string;

  @OneToMany(() => Photo, (photo) => photo.user, { eager: true })
  photos: Photo[];
}
