import { Test, TestingModule } from '@nestjs/testing';
import { GetNoteByIdUseCase } from './get-note-by-id.use-case';
import { NotesService } from '../services/notes.service';
import { Note } from '../../domain/entities/note.entity';

/**
 * Pruebas unitarias para GetNoteByIdUseCase.
 *
 * @description
 * Valida que el caso de uso delegue correctamente la búsqueda
 * de una nota por ID al servicio de aplicación.
 */
describe('GetNoteByIdUseCase', () => {
  let useCase: GetNoteByIdUseCase;
  let mockNotesService: Partial<jest.Mocked<NotesService>>;

  /**
   * Configuración inicial antes de cada prueba.
   */
  beforeEach(async () => {
    mockNotesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNoteByIdUseCase,
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    useCase = module.get<GetNoteByIdUseCase>(GetNoteByIdUseCase);
  });

  /**
   * Verifica que el caso de uso esté definido correctamente.
   */
  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  /**
   * Verifica que execute llame al servicio con el ID correcto.
   *
   * @remarks
   * El caso de uso debe pasar el ID al servicio sin modificarlo.
   */
  it('debería llamar al servicio con el ID proporcionado', async () => {
    // Arrange
    const noteId = '123';
    const mockNote = new Note(
      noteId,
      'Test',
      'Content',
      new Date(),
      new Date(),
    );
    mockNotesService.findById!.mockResolvedValue(mockNote);

    // Act
    const result = await useCase.execute(noteId);

    // Assert
    expect(mockNotesService.findById!).toHaveBeenCalledWith(noteId);
    expect(result).toEqual(mockNote);
  });
});
