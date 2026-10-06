import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

@Entity('enrollments')
@Unique('UQ_student_course', ['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student: Student) => student.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  student: Relation<Student>;

  @ManyToOne(() => Course, (course: Course) => course.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  course: Relation<Course>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
