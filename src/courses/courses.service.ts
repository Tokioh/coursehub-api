import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { Course } from './entities/course.entity.js';

import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(query?: CoursesQueryDto): Promise<PaginatedResponse<Course>> {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const sortBy = query?.sortBy ?? 'id';
    const order = (query?.order ? query.order.toUpperCase() : 'ASC') as 'ASC' | 'DESC';

    const [items, total] = await this.coursesRepository.findAndCount({
      where: query?.level ? { level: query.level } : {},
      order: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number | string): Promise<Course> {
    const course = await this.coursesRepository.findOneBy({ id: Number(id) });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  create(dto: CreateCourseDto) {
    const course = this.coursesRepository.create(dto);
    return this.coursesRepository.save(course);
  }

  async update(id: number | string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);
    Object.assign(course, dto);
    return this.coursesRepository.save(course);
  }

  async remove(id: number | string) {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
    return course;
  }
}