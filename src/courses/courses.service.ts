import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { Course } from './entities/course.entity.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  findAll(level?: string) {
    return this.coursesRepository.find({ where: level ? { level } : {} });
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