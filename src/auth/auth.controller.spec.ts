import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })], // add this line
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            updateAvatar: jest.fn().mockResolvedValue('testAvatar'),
            register: jest.fn().mockResolvedValue({ accessToken: 'testToken' }),
            login: jest.fn().mockResolvedValue({ accessToken: 'testToken' }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should update avatar', async () => {
    expect(
      await authController.updateAvatar(
        {},
        {
          avatar: 'testAvatar',
        },
      ),
    ).toBe('testAvatar');
    expect(authService.updateAvatar).toHaveBeenCalled();
  });

  it('should register a user', async () => {
    const result = { accessToken: 'testToken' };
    expect(
      await authController.register({} as unknown as CreateUserDto),
    ).toEqual(result);
    expect(authService.register).toHaveBeenCalled();
  });

  it('should login a user', async () => {
    const result = { accessToken: 'testToken' };
    expect(
      await authController.login({} as unknown as AuthCredentialsDto),
    ).toEqual(result);
    expect(authService.login).toHaveBeenCalled();
  });
});
