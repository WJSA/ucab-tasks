import { Injectable } from '@nestjs/common';
import { Note } from '../../domain/entities/note.entity';
import { NotesService } from '../services/notes.service';

@Injectable()
export class CreateNoteUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(title: string, content: string): Promise<Note> {
    return await this.notesService.create(title, content);
  }
}
