import { Injectable } from '@nestjs/common';
import { Note } from '../../domain/entities/note.entity';
import { NotesService } from '../services/notes.service';

@Injectable()
export class GetNoteByIdUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(id: string): Promise<Note> {
    return await this.notesService.findById(id);
  }
}
