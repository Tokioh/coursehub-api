import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// permitimos que los filtros sean opcionales, enteros y positivos

export class FilterEnrollmentDto {
  @IsOptional()
  @IsInt({ message: 'El studentId del filtro debe ser un número entero' })
  @IsPositive({ message: 'El studentId debe ser positivo' })
  @Type(() => Number)
  studentId?: number;

  @IsOptional()
  @IsInt({ message: 'El courseId del filtro debe ser un número entero' })
  @IsPositive({ message: 'El courseId debe ser positivo' })
  @Type(() => Number)
  courseId?: number;
}
