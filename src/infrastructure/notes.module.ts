import { Module } from '@nestjs/common';
import { NotesController } from './controllers/notes.controller';
import { DatabaseModule } from './persistence/mongodb/database.module';
import { MongoNoteRepository } from './persistence/mongodb/repositories/mongo-note.repository';
import { NotesService } from '../application/services/notes.service';
import { CreateNoteUseCase } from '../application/use-cases/create-note.use-case';
import { GetAllNotesUseCase } from '../application/use-cases/get-all-notes.use-case';
import { GetNoteByIdUseCase } from '../application/use-cases/get-note-by-id.use-case';
import { UpdateNoteUseCase } from '../application/use-cases/update-note.use-case';
import { DeleteNoteUseCase } from '../application/use-cases/delete-note.use-case';

/**
 * Módulo de Notas que configura todos los componentes relacionados con la gestión de notas.
 *
 * @description
 * Este módulo:
 * - Importa el DatabaseModule para acceder al repositorio de MongoDB
 * - Configura un provider personalizado para inyectar MongoNoteRepository cuando se solicite 'NoteRepository'
 * - Registra el servicio de aplicación y los casos de uso
 * - Expone el controlador REST
 */
@Module({
  imports: [DatabaseModule],
  controllers: [NotesController],
  providers: [
    // Provider personalizado para el repositorio
    // Cuando el servicio pida 'NoteRepository', NestJS inyectará MongoNoteRepository
    // MongoNoteRepository está disponible gracias a la importación del DatabaseModule
    {
      provide: 'NoteRepository',
      useExisting: MongoNoteRepository,
    },
    // Servicio de dominio
    NotesService,
    // Casos de uso
    CreateNoteUseCase,
    GetAllNotesUseCase,
    GetNoteByIdUseCase,
    UpdateNoteUseCase,
    DeleteNoteUseCase,
  ],
})
export class NotesModule {}
