import { Injectable } from '@nestjs/common';
import { Note } from '../../domain/entities/note.entity';
import { NotesService } from '../services/notes.service';

@Injectable()
export class UpdateNoteUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(id: string, title?: string, content?: string): Promise<Note> {
    return await this.notesService.update(id, title, content);
  }
}
