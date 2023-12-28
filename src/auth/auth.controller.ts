import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { omit } from 'lodash';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/users/me')
  @UseGuards(AuthGuard())
  getProfile(@Req() req) {
    return omit(req.user, ['password', 'createdAt', 'updatedAt']);
  }

  @Post('/register')
  signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(authCredentialsDto);
  }
}
