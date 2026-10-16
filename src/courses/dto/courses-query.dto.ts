import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export type CourseSortField = 'id' | 'title' | 'level';
export type SortOrder = 'ASC' | 'DESC' | 'asc' | 'desc';

export class CoursesQueryDto {
  @IsOptional()
  @IsString({ message: 'level debe ser una cadena de texto' })
  level?: string;

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

  @IsOptional()
  @IsIn(['id', 'title', 'level'], {
    message: 'sortBy solo permite: id, title, level',
  })
  sortBy: CourseSortField = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: 'order solo permite: ASC o DESC',
  })
  order: SortOrder = 'ASC';
}
