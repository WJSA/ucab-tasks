import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    description: 'Título de la nota',
    example: 'Mi nota actualizada',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Contenido de la nota',
    example: 'Este es el contenido actualizado',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  content?: string;
}
