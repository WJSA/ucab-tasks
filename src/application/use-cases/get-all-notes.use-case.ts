import { Injectable } from '@nestjs/common';
import { NoteFilter } from '../../domain/types/note-filter.type';
import { NotesService, NoteListItem } from '../services/notes.service';

@Injectable()
export class GetAllNotesUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(filter: NoteFilter): Promise<NoteListItem[]> {
    return await this.notesService.findAll(filter);
  }
}
