import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { omit } from 'lodash';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateAvatarDto } from '../users/dto/update-avatar.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/users/me')
  @UseGuards(AuthGuard())
  getProfile(@Req() req) {
    return omit(req.user, ['password', 'createdAt', 'updatedAt']);
  }

  @Patch('/users/me/avatar')
  @UseGuards(AuthGuard())
  updateAvatar(@Req() req, @Body() updateAvatarDto: UpdateAvatarDto) {
    return this.authService.updateAvatar(req.user, updateAvatarDto);
  }

  @Post('/register')
  register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  login(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(authCredentialsDto);
  }
}
