import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Enrollment } from '../../enrollments/entities/enrollment.entity.js';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  career: string;

  @Column({ type: 'int' })
  semester: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('Enrollment', (enrollment: Enrollment) => enrollment.student)
  enrollments?: Relation<Enrollment>[];
}
