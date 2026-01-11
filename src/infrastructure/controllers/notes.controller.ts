import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateNoteDto } from '../dtos/create-note.dto';
import { UpdateNoteDto } from '../dtos/update-note.dto';
import { QueryNoteDto } from '../dtos/query-note.dto';
import { DeleteNotesDto } from '../dtos/delete-notes.dto';
import { CreateNoteUseCase } from '../../application/use-cases/create-note.use-case';
import { GetAllNotesUseCase } from '../../application/use-cases/get-all-notes.use-case';
import { GetNoteByIdUseCase } from '../../application/use-cases/get-note-by-id.use-case';
import { UpdateNoteUseCase } from '../../application/use-cases/update-note.use-case';
import { DeleteNoteUseCase } from '../../application/use-cases/delete-note.use-case';

/**
 * Controlador REST para la gestión de notas.
 *
 * @description
 * Este controlador expone los endpoints HTTP para realizar operaciones CRUD
 * sobre las notas. Implementa los siguientes endpoints:
 * - GET /notes: Listado con filtrado y ordenamiento
 * - GET /notes/:id: Búsqueda específica por ID
 * - POST /notes: Crear nueva nota
 * - PATCH /notes/:id: Actualizar nota existente
 * - DELETE /notes: Eliminación masiva de notas
 *
 * @remarks
 * El listado general (GET /notes) no incluye el campo 'content' de las notas
 * para optimizar la respuesta. Para obtener el contenido completo, usar
 * GET /notes/:id.
 */
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly getAllNotesUseCase: GetAllNotesUseCase,
    private readonly getNoteByIdUseCase: GetNoteByIdUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
  ) {}

  /**
   * Crea una nueva nota.
   *
   * @param {CreateNoteDto} createNoteDto - DTO con los datos de la nota a crear
   * @param {string} createNoteDto.title - Título de la nota (1-100 caracteres)
   * @param {string} createNoteDto.content - Contenido de la nota
   * @returns {Promise<Note>} La nota creada con su ID, createdAt y updatedAt generados
   *
   * @throws {BadRequestException} Si los datos no cumplen las validaciones
   *
   * @example
   * POST /notes
   * Body: { "title": "Mi nota", "content": "Contenido de la nota" }
   * Response: { "id": "...", "title": "Mi nota", "content": "...", "createdAt": "...", "updatedAt": "..." }
   */
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva nota',
    description:
      'Crea una nueva nota con título y contenido. Los campos createdAt y updatedAt se generan automáticamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'La nota ha sido creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - título o contenido no cumplen validaciones',
  })
  async create(@Body() createNoteDto: CreateNoteDto) {
    return await this.createNoteUseCase.execute(
      createNoteDto.title,
      createNoteDto.content,
    );
  }

  /**
   * Obtiene el listado general de notas con filtrado y ordenamiento.
   *
   * @param {QueryNoteDto} queryDto - DTO con los parámetros de filtrado y ordenamiento
   * @param {string} [queryDto.title] - Filtro de búsqueda parcial por título (case-insensitive)
   * @param {string} [queryDto.sortBy] - Campo por el cual ordenar: 'title', 'createdAt' o 'updatedAt'
   * @param {string} [queryDto.sortOrder] - Dirección del ordenamiento: 'ASC' o 'DESC'
   * @returns {Promise<NoteListItem[]>} Array de notas sin el campo 'content'
   *
   * @remarks
   * Por optimización, este endpoint NO devuelve el campo 'content' de las notas.
   * Para obtener el contenido completo, usar GET /notes/:id
   *
   * @example
   * GET /notes?title=importante&sortBy=createdAt&sortOrder=DESC
   * Response: [{ "id": "...", "title": "...", "createdAt": "...", "updatedAt": "..." }]
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener listado general de notas',
    description:
      'Obtiene todas las notas con opciones de filtrado por título y ordenamiento. ' +
      'Por optimización, NO incluye el campo "content". Para obtener el contenido completo, ' +
      'usar GET /notes/:id',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de notas sin el campo "content" (solo id, title, createdAt, updatedAt)',
  })
  async findAll(@Query() queryDto: QueryNoteDto) {
    return await this.getAllNotesUseCase.execute(queryDto);
  }

  /**
   * Obtiene una nota específica por su ID.
   *
   * @param {string} id - ID de la nota a buscar (MongoDB ObjectId)
   * @returns {Promise<Note>} La nota completa incluyendo todos los campos (id, title, content, createdAt, updatedAt)
   *
   * @throws {NotFoundException} Si la nota con el ID especificado no existe
   *
   * @example
   * GET /notes/507f1f77bcf86cd799439011
   * Response: { "id": "507f1f77bcf86cd799439011", "title": "...", "content": "...", "createdAt": "...", "updatedAt": "..." }
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una nota por ID',
    description:
      'Obtiene una nota específica por su ID. Incluye todos los campos incluyendo el contenido completo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota encontrada con todos sus campos',
  })
  @ApiResponse({
    status: 404,
    description: 'Nota no encontrada con el ID especificado',
  })
  async findOne(@Param('id') id: string) {
    return await this.getNoteByIdUseCase.execute(id);
  }

  /**
   * Actualiza parcialmente una nota existente.
   *
   * @param {string} id - ID de la nota a actualizar (MongoDB ObjectId)
   * @param {UpdateNoteDto} updateNoteDto - DTO con los campos a actualizar
   * @param {string} [updateNoteDto.title] - Nuevo título de la nota (1-100 caracteres)
   * @param {string} [updateNoteDto.content] - Nuevo contenido de la nota
   * @returns {Promise<Note>} La nota actualizada con el campo updatedAt modificado automáticamente
   *
   * @throws {NotFoundException} Si la nota con el ID especificado no existe
   * @throws {BadRequestException} Si los datos no cumplen las validaciones
   *
   * @remarks
   * Solo se actualizan los campos proporcionados. El campo updatedAt se establece
   * automáticamente a la fecha actual por el servicio.
   *
   * @example
   * PATCH /notes/507f1f77bcf86cd799439011
   * Body: { "title": "Nuevo título" }
   * Response: { "id": "...", "title": "Nuevo título", "content": "...", "createdAt": "...", "updatedAt": "..." }
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar título o contenido de una nota',
    description:
      'Actualiza parcialmente una nota. Solo se modifican los campos proporcionados. ' +
      'El campo updatedAt se actualiza automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la nota a actualizar (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'La nota ha sido actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Nota no encontrada con el ID especificado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - título o contenido no cumplen validaciones',
  })
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return await this.updateNoteUseCase.execute(
      id,
      updateNoteDto.title,
      updateNoteDto.content,
    );
  }

  /**
   * Elimina una o múltiples notas de forma masiva.
   *
   * @param {DeleteNotesDto} deleteNotesDto - DTO con el array de IDs a eliminar
   * @param {string[]} deleteNotesDto.ids - Array de IDs de notas a eliminar (mínimo 1)
   * @returns {Promise<void>} No retorna contenido (204 No Content)
   *
   * @throws {NotFoundException} Si alguna de las notas especificadas no existe
   * @throws {BadRequestException} Si el array de IDs está vacío o no es válido
   *
   * @remarks
   * La operación valida que todas las notas existan antes de eliminar.
   * Si alguna no existe, se lanza una excepción y no se elimina ninguna nota.
   * Esto garantiza una operación atómica.
   *
   * @example
   * DELETE /notes
   * Body: { "ids": ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"] }
   * Response: 204 No Content
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminación masiva de notas',
    description:
      'Elimina una o varias notas proporcionando un array de IDs en el cuerpo de la petición. ' +
      'Valida que todas las notas existan antes de eliminar (operación atómica).',
  })
  @ApiResponse({
    status: 204,
    description: 'Las notas han sido eliminadas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description:
      'Una o más notas no fueron encontradas - no se eliminó ninguna nota',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - el array de IDs está vacío o no es válido',
  })
  async removeMany(@Body() deleteNotesDto: DeleteNotesDto) {
    await this.deleteNoteUseCase.execute(deleteNotesDto.ids);
  }
}
