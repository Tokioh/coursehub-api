import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  /**
   * Registra una nueva matrícula aplicando todas las validaciones de negocio:
   * 1. Estudiante existe (404)
   * 2. Estudiante está activo (400)
   * 3. Curso existe (404)
   * 4. Matrícula no duplicada (409)
   */
  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { studentId, courseId } = createEnrollmentDto;

    // 1. Validar que el estudiante exista (findOne lanza NotFoundException 404 si no existe)
    const student = await this.studentsService.findOne(studentId);

    // 2. Validar que el estudiante esté activo (400)
    if (!student.isActive) {
      throw new BadRequestException(
        `El estudiante '${student.name}' (id: ${studentId}) está inactivo y no puede matricularse`,
      );
    }

    // 3. Validar que el curso exista (findOne lanza NotFoundException 404 si no existe)
    const course = await this.coursesService.findOne(courseId);

    // 4. Validar que no exista matrícula duplicada (mismo studentId y courseId)
    const alreadyEnrolled = await this.enrollmentsRepository.findOne({
      where: {
        student: { id: studentId },
        course: { id: courseId },
      },
    });

    if (alreadyEnrolled) {
      throw new ConflictException(
        `El estudiante con id ${studentId} ya está matriculado en el curso con id ${courseId}`,
      );
    }

    // 5. Crear y almacenar la nueva matrícula en PostgreSQL
    try {
      const newEnrollment = this.enrollmentsRepository.create({
        student,
        course,
      });

      return await this.enrollmentsRepository.save(newEnrollment);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          `El estudiante con id ${studentId} ya está matriculado en el curso con id ${courseId}`,
        );
      }
      throw error;
    }
  }

  /**
   * Retorna matrículas con filtros combinables opcionales (search, studentId, courseId, activeOnly),
   * paginación ordenada determinista y carga relacional de student y course.
   */
  async findAll(query?: EnrollmentsQueryDto): Promise<PaginatedResponse<Enrollment>> {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const qb = this.enrollmentsRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course');

    // Búsqueda insensible a mayúsculas/minúsculas por estudiante o curso
    if (query?.search) {
      qb.andWhere(
        '(student.name ILIKE :search OR course.title ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    // Filtros relacionales opcionales
    if (query?.studentId) {
      qb.andWhere('student.id = :studentId', {
        studentId: query.studentId,
      });
    }

    if (query?.courseId) {
      qb.andWhere('course.id = :courseId', {
        courseId: query.courseId,
      });
    }

    // Filtro por estudiantes activos
    if (query?.activeOnly === 'true') {
      qb.andWhere('student.isActive = :active', { active: true });
    }

    // Orden estable y paginación
    qb.orderBy('enrollment.id', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
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

  /**
   * Busca matrículas por estudiante (valida primero que el estudiante exista)
   */
  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.studentsService.findOne(studentId);
    return await this.enrollmentsRepository.find({
      where: { student: { id: studentId } },
      relations: { student: true, course: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca matrículas por curso (valida primero que el curso exista)
   */
  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(courseId);
    return await this.enrollmentsRepository.find({
      where: { course: { id: courseId } },
      relations: { student: true, course: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca una matrícula por su ID con sus relaciones
   */
  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id },
      relations: { student: true, course: true },
    });

    if (!enrollment) {
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }

    return enrollment;
  }

  /**
   * Cancela / elimina una matrícula existente por ID
   */
  async remove(
    id: number,
  ): Promise<{ message: string; deletedEnrollment: Enrollment }> {
    const enrollment = await this.findOne(id);
    await this.enrollmentsRepository.remove(enrollment);

    return {
      message: `Matrícula ${id} cancelada exitosamente`,
      deletedEnrollment: enrollment,
    };
  }
}
