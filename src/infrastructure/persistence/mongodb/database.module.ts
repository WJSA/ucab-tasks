import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoteDocument, NoteSchema } from './schemas/note.schema';
import { MongoNoteRepository } from './repositories/mongo-note.repository';

/**
 * Módulo de base de datos que configura la conexión a MongoDB y los repositorios.
 *
 * @description
 * Este módulo:
 * - Configura la conexión a MongoDB usando Mongoose de forma asíncrona
 * - Registra los esquemas de Mongoose
 * - Expone los repositorios para su uso en otros módulos
 *
 * @remarks
 * La URL de conexión se obtiene de las variables de entorno mediante ConfigService:
 * - MONGO_URI: URL completa de conexión (ej: mongodb+srv://...)
 * - Si no está definida, usa una URL por defecto para desarrollo local
 */
@Module({
  imports: [
    // Configuración asíncrona de la conexión a MongoDB usando ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/ucab-tasks',
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      inject: [ConfigService],
    }),
    // Registro de esquemas
    MongooseModule.forFeature([
      {
        name: NoteDocument.name,
        schema: NoteSchema,
      },
    ]),
  ],
  providers: [MongoNoteRepository],
  exports: [MongoNoteRepository],
})
export class DatabaseModule {}
