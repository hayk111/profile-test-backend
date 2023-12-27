import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { User as UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    console.log(
      '🚀 ~ UsersRepository ~ createUser ~ authCredentialsDto',
      authCredentialsDto,
    );
    const { email, password } = authCredentialsDto;

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log(
      '🚀 ~ UsersRepository ~ createUser ~ hashedPassword',
      hashedPassword,
    );

    const user = this.create({ email, password: hashedPassword });
    console.log('🚀 ~ UsersRepository ~ createUser ~ user', user);

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate email
        throw new ConflictException('email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
