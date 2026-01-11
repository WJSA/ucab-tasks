import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class DeleteNotesDto {
  @ApiProperty({
    description: 'Array de IDs de notas a eliminar',
    example: [
      'aa5e0075-d3c9-47bb-bd9d-9eca0f33e08e',
      'bb6f1186-e4da-58cc-ce8b-af9db0f44f9f',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Debe proporcionar al menos un ID para eliminar',
  })
  @IsString({ each: true, message: 'Cada ID debe ser una cadena de texto' })
  ids: string[];
}
