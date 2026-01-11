import { Test, TestingModule } from '@nestjs/testing';
import { DeleteNoteUseCase } from './delete-note.use-case';
import { NotesService } from '../services/notes.service';

/**
 * Pruebas unitarias para DeleteNoteUseCase.
 *
 * @description
 * Valida que el caso de uso delegue correctamente la eliminación
 * de notas al servicio de aplicación.
 */
describe('DeleteNoteUseCase', () => {
  let useCase: DeleteNoteUseCase;
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
        DeleteNoteUseCase,
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    useCase = module.get<DeleteNoteUseCase>(DeleteNoteUseCase);
  });

  /**
   * Verifica que el caso de uso esté definido correctamente.
   */
  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  /**
   * Verifica que execute llame al servicio con un string.
   *
   * @remarks
   * El servicio debe manejar tanto string como array de strings,
   * el caso de uso solo pasa el parámetro recibido.
   */
  it('debería llamar al servicio con un string', async () => {
    // Arrange
    const noteId = '123';
    mockNotesService.delete!.mockResolvedValue(undefined);

    // Act
    await useCase.execute(noteId);

    // Assert
    expect(mockNotesService.delete!).toHaveBeenCalledWith(noteId);
  });

  /**
   * Verifica que execute llame al servicio con un array de strings.
   */
  it('debería llamar al servicio con un array de IDs', async () => {
    // Arrange
    const noteIds = ['123', '456', '789'];
    mockNotesService.delete!.mockResolvedValue(undefined);

    // Act
    await useCase.execute(noteIds);

    // Assert
    expect(mockNotesService.delete!).toHaveBeenCalledWith(noteIds);
  });
});
