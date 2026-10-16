import {
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EnrollmentsQueryDto {
  @IsOptional()
  @IsString({ message: 'El término search debe ser una cadena de texto' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'studentId debe ser un número entero' })
  @Min(1, { message: 'studentId debe ser mayor o igual a 1' })
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'courseId debe ser un número entero' })
  @Min(1, { message: 'courseId debe ser mayor o igual a 1' })
  courseId?: number;

  @IsOptional()
  @IsBooleanString({
    message: 'activeOnly debe ser un valor booleano ("true" o "false")',
  })
  activeOnly?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(50, { message: 'limit no puede ser mayor a 50' })
  limit: number = 10;
}
