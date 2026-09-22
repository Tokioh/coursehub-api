import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { StudentsModule } from '../students/students.module.js';
import { CoursesModule } from '../courses/courses.module.js';

@Module({
  // importamos los modulos de estudiantes y cursos para poder usar sus servicios
  imports: [StudentsModule, CoursesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule { }
