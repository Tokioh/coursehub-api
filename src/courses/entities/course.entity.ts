import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  level: string;

  @OneToMany('Enrollment', (enrollment: Enrollment) => enrollment.course)
  enrollments?: Relation<Enrollment>[];
}