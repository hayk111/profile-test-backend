import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from '../users/users.repository';
import { JwtPayload } from './jwt-payload.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PhotosRepository } from '../photos/photos.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PhotosRepository)
    private photosRepository: PhotosRepository,
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    await this.usersRepository.createUser(createUserDto, createUserDto.photos);
    const { email } = createUserDto;
    const accessToken = this.jwtService.sign({ email });
    return { accessToken };
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { email };

      const accessToken: string = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }
}
