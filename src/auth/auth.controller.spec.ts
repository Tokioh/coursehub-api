import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register', async () => {
    const registerDto = { email: 'user@example.com', password: 'password123' };
    const expected = { id: 1, email: 'user@example.com', createdAt: new Date() };
    authService.register.mockResolvedValue(expected);

    const result = await controller.register(registerDto);
    expect(authService.register).toHaveBeenCalledWith(registerDto);
    expect(result).toBe(expected);
  });

  it('should call authService.login', async () => {
    const loginDto = { email: 'user@example.com', password: 'password123' };
    const expected = { id: 1, email: 'user@example.com', createdAt: new Date() };
    authService.login.mockResolvedValue(expected);

    const result = await controller.login(loginDto);
    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(result).toBe(expected);
  });
});
