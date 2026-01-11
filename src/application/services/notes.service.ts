import { Injectable, Inject } from '@nestjs/common';
import { Note } from '../../domain/entities/note.entity';
import type { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { NoteFilter } from '../../domain/types/note-filter.type';

export interface NoteListItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotesService {
  constructor(
    @Inject('NoteRepository')
    private readonly noteRepository: INoteRepository,
  ) {}

  /**
   * Obtiene todas las notas aplicando filtros y ordenamiento.
   * Omite el campo 'content' en los resultados para optimizar la respuesta.
   */
  async findAll(filter: NoteFilter): Promise<NoteListItem[]> {
    const notes = await this.noteRepository.findAll(filter);

    // Mapear para omitir el campo 'content'
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }

  /**
   * Obtiene una nota completa por su ID.
   * Retorna todos los campos incluyendo 'content'.
   */
  async findById(id: string): Promise<Note> {
    return await this.noteRepository.findById(id);
  }

  /**
   * Crea una nueva nota.
   */
  async create(title: string, content: string): Promise<Note> {
    return await this.noteRepository.create({ title, content });
  }

  /**
   * Actualiza una nota existente.
   * Establece automáticamente el campo 'updatedAt' a la fecha actual.
   */
  async update(id: string, title?: string, content?: string): Promise<Note> {
    const updateData: Partial<Note> = {
      updatedAt: new Date(), // Establecer automáticamente updatedAt
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    return await this.noteRepository.update(id, updateData);
  }

  /**
   * Elimina una o varias notas.
   * Acepta tanto un solo ID como un array de IDs.
   */
  async delete(ids: string | string[]): Promise<void> {
    // Normalizar a array si se recibe un solo ID
    const idsArray = Array.isArray(ids) ? ids : [ids];
    await this.noteRepository.delete(idsArray);
  }
}
