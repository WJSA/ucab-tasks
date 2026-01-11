import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Note } from '../../domain/entities/note.entity';
import { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { NoteFilter } from '../../domain/types/note-filter.type';

@Injectable()
export class InMemoryNoteRepository implements INoteRepository {
  private notes: Note[] = [];

  async findAll(filter: NoteFilter): Promise<Note[]> {
    let filteredNotes = [...this.notes];

    // Filtrar por título si se proporciona
    if (filter.title) {
      const searchTitle = filter.title.toLowerCase();
      filteredNotes = filteredNotes.filter((note) =>
        note.title.toLowerCase().includes(searchTitle),
      );
    }

    // Ordenar si se especifica
    if (filter.sortBy) {
      const sortOrder = filter.sortOrder === 'DESC' ? -1 : 1;
      const sortField = filter.sortBy;

      filteredNotes.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return -1 * sortOrder;
        if (aValue > bValue) return 1 * sortOrder;
        return 0;
      });
    }

    return Promise.resolve(filteredNotes);
  }

  async findById(id: string): Promise<Note> {
    const note = this.notes.find((note) => note.id === id);
    if (!note) {
      throw new NotFoundException(`Nota con id ${id} no encontrada`);
    }
    return Promise.resolve(note);
  }

  async create(noteData: Partial<Note>): Promise<Note> {
    const now = new Date();
    const note = new Note(
      randomUUID(),
      noteData.title!,
      noteData.content!,
      now,
      now,
    );
    this.notes.push(note);
    return Promise.resolve(note);
  }

  async update(id: string, noteData: Partial<Note>): Promise<Note> {
    const index = this.notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFoundException(`Nota con id ${id} no encontrada`);
    }

    this.notes[index] = {
      ...this.notes[index],
      ...noteData,
      updatedAt: new Date(),
    };

    return Promise.resolve(this.notes[index]);
  }

  async delete(ids: string[]): Promise<void> {
    const notFoundIds: string[] = [];

    ids.forEach((id) => {
      const index = this.notes.findIndex((note) => note.id === id);
      if (index === -1) {
        notFoundIds.push(id);
      }
    });

    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `Notas con los siguientes IDs no fueron encontradas: ${notFoundIds.join(', ')}`,
      );
    }

    this.notes = this.notes.filter((note) => !ids.includes(note.id));
    return Promise.resolve();
  }
}
