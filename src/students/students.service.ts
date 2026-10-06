import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const emailExists = await this.studentsRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (emailExists) {
      throw new ConflictException(
        `El correo electrónico '${createStudentDto.email}' ya se encuentra registrado`,
      );
    }

    try {
      const student = this.studentsRepository.create({
        ...createStudentDto,
        isActive: createStudentDto.isActive ?? true,
      });
      return await this.studentsRepository.save(student);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          `El correo electrónico '${createStudentDto.email}' ya se encuentra registrado`,
        );
      }
      throw error;
    }
  }

  async findAll(filters?: FilterStudentDto): Promise<Student[]> {
    const query = this.studentsRepository.createQueryBuilder('student');

    if (filters?.career) {
      query.andWhere('LOWER(student.career) LIKE LOWER(:career)', {
        career: `%${filters.career}%`,
      });
    }

    if (filters?.semester !== undefined) {
      query.andWhere('student.semester = :semester', {
        semester: filters.semester,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('student.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    query.orderBy('student.id', 'ASC');
    return await query.getMany();
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id: Number(id) },
    });
    if (!student) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (
      updateStudentDto.email &&
      updateStudentDto.email.toLowerCase() !== student.email.toLowerCase()
    ) {
      const emailExists = await this.studentsRepository.findOne({
        where: { email: updateStudentDto.email },
      });

      if (emailExists && emailExists.id !== Number(id)) {
        throw new ConflictException(
          `El correo electrónico '${updateStudentDto.email}' ya pertenece a otro estudiante`,
        );
      }
    }

    Object.assign(student, updateStudentDto);
    try {
      return await this.studentsRepository.save(student);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          `El correo electrónico '${updateStudentDto.email}' ya pertenece a otro estudiante`,
        );
      }
      throw error;
    }
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Student> {
    const student = await this.findOne(id);
    student.isActive = updateStatusDto.isActive;
    return await this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<Student> {
    const student = await this.findOne(id);

    if (!student.isActive) {
      throw new BadRequestException(
        'No se puede eliminar un estudiante que se encuentra inactivo',
      );
    }

    await this.studentsRepository.remove(student);
    return student;
  }
}
