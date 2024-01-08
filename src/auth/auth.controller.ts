import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { omit } from 'lodash';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateAvatarDto } from '../users/dto/update-avatar.dto';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/users/me')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile' })
  @ApiResponse({ status: 200, description: 'Returns the profile info.' })
  getProfile(@Req() req) {
    return omit(req.user, ['password', 'createdAt', 'updatedAt']);
  }

  @Patch('/users/me/avatar')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user's avatar" })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({ status: 200, description: 'Returns the updated avatar URL.' })
  updateAvatar(@Req() req, @Body() updateAvatarDto: UpdateAvatarDto) {
    return this.authService.updateAvatar(req.user, updateAvatarDto);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Returns the access token.',
    type: String,
  })
  register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.register(createUserDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Log in' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the access token.',
    type: String,
  })
  login(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(authCredentialsDto);
  }
}
