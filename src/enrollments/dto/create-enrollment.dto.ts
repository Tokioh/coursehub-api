import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';


// validamos que estudentId y courseId sean obligatorios, enteros y positivos

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'El studentId es obligatorio' })
  @IsInt({ message: 'El studentId debe ser un número entero' })
  @IsPositive({ message: 'El studentId debe ser positivo' })
  @Type(() => Number)
  studentId: number;

  @IsNotEmpty({ message: 'El courseId es obligatorio' })
  @IsInt({ message: 'El courseId debe ser un número entero' })
  @IsPositive({ message: 'El courseId debe ser positivo' })
  @Type(() => Number)
  courseId: number;
}
