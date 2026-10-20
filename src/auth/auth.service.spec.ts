import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findByEmailWithPassword: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return safe data', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        id: 1,
        email: 'test@example.com',
        createdAt: new Date(),
      };

      usersService.create.mockResolvedValue(expectedResponse);

      const result = await service.register(registerDto);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should login successfully and return safe user data without hash', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
        createdAt: new Date(),
      };

      usersService.findByEmailWithPassword.mockResolvedValue(user);

      const result = await service.login(loginDto);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw 401 Unauthorized with generic message when user does not exist', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
    });

    it('should throw 401 Unauthorized with generic message when password does not match', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash,
        createdAt: new Date(),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(
        new UnauthorizedException('Credenciales inválidas'),
      );
    });
  });
});
