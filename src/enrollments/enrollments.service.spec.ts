import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            remove: vi.fn(),
            createQueryBuilder: vi.fn().mockReturnValue({
              leftJoinAndSelect: vi.fn().mockReturnThis(),
              andWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              skip: vi.fn().mockReturnThis(),
              take: vi.fn().mockReturnThis(),
              getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            }),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findOne: vi.fn(),
          },
        },
        {
          provide: CoursesService,
          useValue: {
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated enrollments structure', async () => {
    const result = await service.findAll();
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('meta');
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });
});
