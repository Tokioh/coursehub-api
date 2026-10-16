import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: {
            find: vi.fn(),
            findAndCount: vi.fn().mockResolvedValue([[], 0]),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated courses structure', async () => {
    const result = await service.findAll();
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('meta');
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });
});
