import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      createQueryBuilder: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new user with hashed password', async () => {
      const createUserDto = {
        email: 'NEW.User@example.com ',
        password: 'password123',
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockImplementation((dto) => dto);
      repository.save.mockImplementation((entity) =>
        Promise.resolve({
          id: 1,
          email: entity.email,
          createdAt: new Date(),
        }),
      );

      const result = await service.create(createUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'new.user@example.com' },
      });
      expect(result.id).toBe(1);
      expect(result.email).toBe('new.user@example.com');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email already registered in check', async () => {
      repository.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(
        service.create({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should catch db error 23505 and throw ConflictException', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({});
      repository.save.mockRejectedValue({ code: '23505' });

      await expect(
        service.create({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should search with normalized email', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.findByEmail('  TEST@Domain.COM ');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@domain.com' },
      });
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should query with addSelect for passwordHash', async () => {
      const qb: any = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue({
          id: 1,
          email: 'test@example.com',
          passwordHash: 'hash123',
        }),
      };
      repository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findByEmailWithPassword(' TEST@Example.COM ');

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(qb.where).toHaveBeenCalledWith('user.email = :email', {
        email: 'test@example.com',
      });
      expect(result?.passwordHash).toBe('hash123');
    });
  });
});
