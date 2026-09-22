import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Enrollment } from './interfaces/enrollment.interface.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';


@Injectable()
export class EnrollmentsService {
  // Matrículas iniciales de prueba en memoria
  private enrollments: Enrollment[] = [
    { id: 1, studentId: 1, courseId: 1 },
    { id: 2, studentId: 1, courseId: 2 },
  ];
  private nextId = 3;

  constructor(
    // Inyección de dependencias de los servicios de otros módulos
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) { }

  /**
   * Registra una nueva matrícula aplicando todas las validaciones de negocio:
   * 1. Estudiante existe
   * 2. Estudiante está activo
   * 3. Curso existe
   * 4. Matrícula no duplicada
   */
  create(createEnrollmentDto: CreateEnrollmentDto): Enrollment {
    const { studentId, courseId } = createEnrollmentDto;

    // 1. Validar que el estudiante exista (findOne lanza NotFoundException si no existe)
    const student = this.studentsService.findOne(studentId);

    // 2. Validar que el estudiante esté activo
    if (!student.isActive) {
      throw new BadRequestException(
        `El estudiante '${student.name}' (id: ${studentId}) está inactivo y no puede matricularse`,
      );
    }

    // 3. Validar que el curso exista
    const course = this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(
        `El curso con id ${courseId} no fue encontrado`,
      );
    }

    // 4. Validar que no exista matrícula duplicada (mismo studentId y courseId)
    const alreadyEnrolled = this.enrollments.some(
      (e) => e.studentId === studentId && e.courseId === courseId,
    );

    if (alreadyEnrolled) {
      throw new ConflictException(
        `El estudiante con id ${studentId} ya está matriculado en el curso ${courseId}`,
      );
    }

    // 5. Crear y almacenar la nueva matrícula
    const newEnrollment: Enrollment = {
      id: this.nextId++,
      studentId,
      courseId,
      enrolledAt: new Date(),
    };

    this.enrollments.push(newEnrollment);
    return newEnrollment;
  }

  /**
   * Retorna matrículas con filtros combinables opcionales (studentId y/o courseId)
   */
  findAll(filters?: FilterEnrollmentDto): Enrollment[] {
    let result = [...this.enrollments];

    if (!filters) {
      return result;
    }

    if (filters.studentId !== undefined) {
      result = result.filter((e) => e.studentId === filters.studentId);
    }

    if (filters.courseId !== undefined) {
      result = result.filter((e) => e.courseId === filters.courseId);
    }

    return result;
  }

  /**
   * Busca matrículas por estudiante (valida primero que el estudiante exista)
   */
  findByStudent(studentId: number): Enrollment[] {
    this.studentsService.findOne(studentId);
    return this.enrollments.filter((e) => e.studentId === studentId);
  }

  /**
   * Busca matrículas por curso (valida primero que el curso exista)
   */
  findByCourse(courseId: number): Enrollment[] {
    const course = this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(`El curso con id ${courseId} no existe`);
    }
    return this.enrollments.filter((e) => e.courseId === courseId);
  }

  /**
   * Busca una matrícula por su ID
   */
  findOne(id: number): Enrollment {
    const enrollment = this.enrollments.find((e) => e.id === id);
    if (!enrollment) {
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }
    return enrollment;
  }

  /**
   * Cancela / elimina una matrícula existente por ID
   */
  remove(id: number): { message: string; deletedEnrollment: Enrollment } {
    const index = this.enrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(
        `No se puede cancelar la matrícula: el id ${id} no existe`,
      );
    }

    const [deletedEnrollment] = this.enrollments.splice(index, 1);
    return {
      message: `Matrícula ${id} cancelada exitosamente`,
      deletedEnrollment,
    };
  }
}
