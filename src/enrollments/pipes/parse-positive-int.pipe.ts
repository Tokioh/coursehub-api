import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

// validamos que el id sea un entero positivo mayor a 0 

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val) || val <= 0) {
      throw new BadRequestException(
        `El parámetro '${metadata.data || 'id'}' con valor '${value}' debe ser un entero positivo mayor a 0`,
      );
    }
    return val;
  }
}
