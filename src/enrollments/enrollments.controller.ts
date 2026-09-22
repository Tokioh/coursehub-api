import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto.js';
import { ParsePositiveIntPipe } from './pipes/parse-positive-int.pipe.js';

@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // 1. POST /enrollments (Crea una nueva matrícula)
  @Post('enrollments')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  // 2. GET /enrollments?studentId=1&courseId=2 (Consulta con filtros combinables opcionales)
  @Get('enrollments')
  findAll(@Query() filters: FilterEnrollmentDto) {
    return this.enrollmentsService.findAll(filters);
  }

  // 3. GET /students/:studentId/enrollments (Consulta matrículas de un estudiante específico)
  @Get('students/:studentId/enrollments')
  findByStudent(@Param('studentId', ParsePositiveIntPipe) studentId: number) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  // 4. GET /courses/:courseId/enrollments (Consulta matrículas de un curso específico)
  @Get('courses/:courseId/enrollments')
  findByCourse(@Param('courseId', ParsePositiveIntPipe) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  // 5. DELETE /enrollments/:id (Cancela / elimina una matrícula por ID)
  @Delete('enrollments/:id')
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
