import { Note } from '../entities/note.entity';
import { NoteFilter } from '../types/note-filter.type';

export interface INoteRepository {
  findAll(filter: NoteFilter): Promise<Note[]>;
  findById(id: string): Promise<Note>;
  create(note: Partial<Note>): Promise<Note>;
  update(id: string, note: Partial<Note>): Promise<Note>;
  delete(ids: string[]): Promise<void>;
}
