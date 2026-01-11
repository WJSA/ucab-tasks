import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Esquema de Mongoose para la colección de notas en MongoDB.
 *
 * @description
 * Este esquema define la estructura de los documentos de notas en MongoDB.
 * Mapea la entidad Note del dominio a un documento de MongoDB.
 *
 * @remarks
 * - El campo _id de MongoDB se mapea automáticamente al campo id de la entidad
 * - Los timestamps (createdAt, updatedAt) se gestionan automáticamente por Mongoose
 */
@Schema({
  collection: 'notes',
  timestamps: true, // Habilita createdAt y updatedAt automáticos
  versionKey: false, // Deshabilita el campo __v
})
export class NoteDocument extends Document {
  /**
   * Título de la nota
   * @type {string}
   */
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  /**
   * Contenido de la nota
   * @type {string}
   */
  @Prop({ required: true })
  content: string;

  /**
   * Fecha de creación (gestionada automáticamente por Mongoose)
   * @type {Date}
   */
  createdAt: Date;

  /**
   * Fecha de última actualización (gestionada automáticamente por Mongoose)
   * @type {Date}
   */
  updatedAt: Date;
}

/**
 * Factory del esquema de Mongoose para NoteDocument
 */
export const NoteSchema = SchemaFactory.createForClass(NoteDocument);

/**
 * Configuración de índices para optimizar las búsquedas
 */
NoteSchema.index({ title: 1 }); // Índice para búsquedas por título
NoteSchema.index({ createdAt: -1 }); // Índice para ordenamiento por fecha de creación
NoteSchema.index({ updatedAt: -1 }); // Índice para ordenamiento por fecha de actualización
