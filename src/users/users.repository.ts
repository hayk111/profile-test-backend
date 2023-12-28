import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { omit, startCase, toLower } from 'lodash';
import { Client as ClientEntity } from './client.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository extends Repository<ClientEntity> {
  constructor(private dataSource: DataSource) {
    super(ClientEntity, dataSource.createEntityManager());
  }

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { password, firstName, lastName } = createUserDto;

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = this.create({
      ...omit(createUserDto, 'password', 'firstName', 'lastName'),
      fullName: startCase(toLower(`${firstName} ${lastName}`)),
      password: hashedPassword,
    });

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
