import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryNoteDto {
  @ApiPropertyOptional({
    description: 'Filtrar por título (búsqueda parcial)',
    example: 'Mi nota',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['title', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'createdAt', 'updatedAt'])
  sortBy?: 'title' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
