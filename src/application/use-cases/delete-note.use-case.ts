import { Injectable } from '@nestjs/common';
import { NotesService } from '../services/notes.service';

@Injectable()
export class DeleteNoteUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(ids: string | string[]): Promise<void> {
    await this.notesService.delete(ids);
  }
}
