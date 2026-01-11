import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../../../../domain/entities/note.entity';
import { INoteRepository } from '../../../../domain/repositories/note.repository.interface';
import { NoteFilter } from '../../../../domain/types/note-filter.type';
import { NoteDocument } from '../schemas/note.schema';

/**
 * Implementación de MongoDB para el repositorio de notas.
 *
 * @description
 * Esta clase implementa la interfaz INoteRepository usando Mongoose para
 * interactuar con MongoDB. Maneja el mapeo entre documentos de MongoDB
 * y entidades del dominio.
 *
 * @implements {INoteRepository}
 */
@Injectable()
export class MongoNoteRepository implements INoteRepository {
  constructor(
    @InjectModel(NoteDocument.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  /**
   * Obtiene todas las notas aplicando filtros y ordenamiento.
   *
   * @param {NoteFilter} filter - Objeto con criterios de filtrado y ordenamiento
   * @param {string} [filter.title] - Filtro de búsqueda parcial por título (case-insensitive)
   * @param {string} [filter.sortBy] - Campo por el cual ordenar (title, createdAt, updatedAt)
   * @param {string} [filter.sortOrder] - Dirección del ordenamiento (ASC o DESC)
   * @returns {Promise<Note[]>} Array de notas que cumplen los criterios
   *
   * @example
   * ```typescript
   * // Buscar notas con "importante" en el título, ordenadas por fecha descendente
   * const notes = await repository.findAll({
   *   title: 'importante',
   *   sortBy: 'createdAt',
   *   sortOrder: 'DESC'
   * });
   * ```
   */
  async findAll(filter: NoteFilter): Promise<Note[]> {
    // Construir el filtro de búsqueda
    const query: Record<string, unknown> = {};

    // Filtrar por título si se proporciona (búsqueda parcial case-insensitive)
    if (filter.title) {
      query.title = { $regex: filter.title, $options: 'i' };
    }

    // Construir el objeto de ordenamiento
    const sort: Record<string, 1 | -1> = {};
    if (filter.sortBy) {
      // Mapear el orden: ASC = 1, DESC = -1
      sort[filter.sortBy] = filter.sortOrder === 'DESC' ? -1 : 1;
    } else {
      // Ordenamiento por defecto: por fecha de creación descendente
      sort.createdAt = -1;
    }

    // Ejecutar la query con filtro y ordenamiento
    const documents = await this.noteModel.find(query).sort(sort).exec();

    // Mapear documentos de MongoDB a entidades del dominio
    return documents.map((doc) => this.mapToEntity(doc));
  }

  /**
   * Obtiene una nota por su ID.
   *
   * @param {string} id - ID de la nota a buscar
   * @returns {Promise<Note>} La nota encontrada
   * @throws {NotFoundException} Si la nota no existe
   *
   * @example
   * ```typescript
   * const note = await repository.findById('507f1f77bcf86cd799439011');
   * ```
   */
  async findById(id: string): Promise<Note> {
    const document = await this.noteModel.findById(id).exec();

    if (!document) {
      throw new NotFoundException(`Nota con id ${id} no encontrada`);
    }

    return this.mapToEntity(document);
  }

  /**
   * Crea una nueva nota en la base de datos.
   *
   * @param {Partial<Note>} noteData - Datos parciales de la nota a crear
   * @param {string} noteData.title - Título de la nota
   * @param {string} noteData.content - Contenido de la nota
   * @returns {Promise<Note>} La nota creada con su ID generado
   *
   * @remarks
   * MongoDB genera automáticamente el _id y Mongoose gestiona los timestamps
   * (createdAt, updatedAt).
   *
   * @example
   * ```typescript
   * const note = await repository.create({
   *   title: 'Mi nota',
   *   content: 'Contenido de la nota'
   * });
   * ```
   */
  async create(noteData: Partial<Note>): Promise<Note> {
    const createdDocument = new this.noteModel({
      title: noteData.title,
      content: noteData.content,
    });

    const savedDocument = await createdDocument.save();
    return this.mapToEntity(savedDocument);
  }

  /**
   * Actualiza una nota existente.
   *
   * @param {string} id - ID de la nota a actualizar
   * @param {Partial<Note>} noteData - Datos parciales a actualizar
   * @param {string} [noteData.title] - Nuevo título de la nota
   * @param {string} [noteData.content] - Nuevo contenido de la nota
   * @param {Date} [noteData.updatedAt] - Fecha de actualización (gestionada por el servicio)
   * @returns {Promise<Note>} La nota actualizada
   * @throws {NotFoundException} Si la nota no existe
   *
   * @remarks
   * Solo actualiza los campos proporcionados. El campo updatedAt se actualiza
   * automáticamente por Mongoose si está habilitado timestamps.
   *
   * @example
   * ```typescript
   * const note = await repository.update('507f1f77bcf86cd799439011', {
   *   title: 'Nuevo título'
   * });
   * ```
   */
  async update(id: string, noteData: Partial<Note>): Promise<Note> {
    const updatedDocument = await this.noteModel
      .findByIdAndUpdate(
        id,
        {
          $set: noteData,
        },
        {
          new: true, // Retornar el documento actualizado
          runValidators: true, // Ejecutar validaciones del esquema
        },
      )
      .exec();

    if (!updatedDocument) {
      throw new NotFoundException(`Nota con id ${id} no encontrada`);
    }

    return this.mapToEntity(updatedDocument);
  }

  /**
   * Elimina una o varias notas de la base de datos.
   *
   * @param {string[]} ids - Array de IDs de las notas a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundException} Si alguna de las notas no existe
   *
   * @remarks
   * Valida que todas las notas existan antes de eliminar. Si alguna no existe,
   * lanza una excepción y no se elimina ninguna nota (operación atómica).
   *
   * @example
   * ```typescript
   * // Eliminar una nota
   * await repository.delete(['507f1f77bcf86cd799439011']);
   *
   * // Eliminar múltiples notas
   * await repository.delete([
   *   '507f1f77bcf86cd799439011',
   *   '507f191e810c19729de860ea'
   * ]);
   * ```
   */
  async delete(ids: string[]): Promise<void> {
    // Validar que todas las notas existan
    const existingNotes = await this.noteModel
      .find({ _id: { $in: ids } })
      .select('_id')
      .exec();

    const existingIds = existingNotes.map((note) => note._id.toString());
    const notFoundIds = ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Notas con los siguientes IDs no fueron encontradas: ${notFoundIds.join(', ')}`,
      );
    }

    // Eliminar las notas
    await this.noteModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  /**
   * Mapea un documento de MongoDB a una entidad del dominio.
   *
   * @private
   * @param {NoteDocument} document - Documento de Mongoose
   * @returns {Note} Entidad del dominio
   *
   * @remarks
   * Este método convierte el _id de MongoDB (ObjectId) a string y mapea
   * los campos del documento a la estructura de la entidad Note.
   */
  private mapToEntity(document: NoteDocument): Note {
    return new Note(
      document._id.toString(), // Convertir ObjectId a string
      document.title,
      document.content,
      document.createdAt,
      document.updatedAt,
    );
  }
}
