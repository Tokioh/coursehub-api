import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Student } from './interfaces/student.interface.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';

@Injectable()
export class StudentsService {
  private students: Student[] = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@uleam.edu.ec',
      age: 21,
      career: 'Software',
      semester: 5,
      isActive: true,
    },
    {
      id: 2,
      name: 'Ana Belén Gómez',
      email: 'ana.gomez@uleam.edu.ec',
      age: 20,
      career: 'Software',
      semester: 4,
      isActive: false,
    },
  ];
  private nextId: number = 3;

  create(createStudentDto: CreateStudentDto): Student {
    const emailExists = this.students.some(
      (s) => s.email.toLowerCase() === createStudentDto.email.toLowerCase(),
    );

    if (emailExists) {
      throw new ConflictException(
        `El correo electrónico '${createStudentDto.email}' ya se encuentra registrado`,
      );
    }

    const newStudent: Student = {
      id: this.nextId++,
      name: createStudentDto.name,
      email: createStudentDto.email,
      age: createStudentDto.age,
      career: createStudentDto.career,
      semester: createStudentDto.semester,
      isActive: createStudentDto.isActive ?? true,
    };

    this.students.push(newStudent);
    return newStudent;
  }

  findAll(filters?: FilterStudentDto): Student[] {
    let result = [...this.students];

    if (!filters) {
      return result;
    }

    if (filters.career) {
      const careerFilter = filters.career.toLowerCase();
      result = result.filter((s) =>
        s.career.toLowerCase().includes(careerFilter),
      );
    }

    if (filters.semester !== undefined) {
      result = result.filter((s) => s.semester === filters.semester);
    }

    if (filters.isActive !== undefined) {
      result = result.filter((s) => s.isActive === filters.isActive);
    }

    return result;
  }

  findOne(id: number): Student {
    const student = this.students.find((s) => s.id === id);
    if (!student) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }
    return student;
  }

  update(id: number, updateStudentDto: UpdateStudentDto): Student {
    const student = this.findOne(id);

    if (
      updateStudentDto.email &&
      updateStudentDto.email.toLowerCase() !== student.email.toLowerCase()
    ) {
      const emailExists = this.students.some(
        (s) =>
          s.id !== id &&
          s.email.toLowerCase() === updateStudentDto.email!.toLowerCase(),
      );

      if (emailExists) {
        throw new ConflictException(
          `El correo electrónico '${updateStudentDto.email}' ya pertenece a otro estudiante`,
        );
      }
    }

    Object.assign(student, updateStudentDto);
    return student;
  }

  updateStatus(id: number, updateStatusDto: UpdateStatusDto): Student {
    const student = this.findOne(id);
    student.isActive = updateStatusDto.isActive;
    return student;
  }

  remove(id: number): Student {
    const student = this.findOne(id);

    if (!student.isActive) {
      throw new BadRequestException(
        'No se puede eliminar un estudiante que se encuentra inactivo',
      );
    }

    const index = this.students.findIndex((s) => s.id === id);
    const [removedStudent] = this.students.splice(index, 1);
    return removedStudent;
  }
}
