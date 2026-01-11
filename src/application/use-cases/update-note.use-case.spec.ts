import { Test, TestingModule } from '@nestjs/testing';
import { UpdateNoteUseCase } from './update-note.use-case';
import { NotesService } from '../services/notes.service';
import { Note } from '../../domain/entities/note.entity';

/**
 * Pruebas unitarias para UpdateNoteUseCase.
 *
 * @description
 * Valida que el caso de uso delegue correctamente la actualización
 * de notas al servicio de aplicación.
 */
describe('UpdateNoteUseCase', () => {
  let useCase: UpdateNoteUseCase;
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
        UpdateNoteUseCase,
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateNoteUseCase>(UpdateNoteUseCase);
  });

  /**
   * Verifica que el caso de uso esté definido correctamente.
   */
  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  /**
   * Verifica que execute llame al servicio con los parámetros correctos.
   *
   * @remarks
   * El caso de uso debe pasar el ID y los campos a actualizar
   * al servicio sin modificarlos.
   */
  it('debería llamar al servicio con ID, título y contenido', async () => {
    // Arrange
    const noteId = '123';
    const title = 'Título actualizado';
    const content = 'Contenido actualizado';
    const mockNote = new Note(noteId, title, content, new Date(), new Date());
    mockNotesService.update!.mockResolvedValue(mockNote);

    // Act
    const result = await useCase.execute(noteId, title, content);

    // Assert
    expect(mockNotesService.update!).toHaveBeenCalledWith(
      noteId,
      title,
      content,
    );
    expect(result).toEqual(mockNote);
  });

  /**
   * Verifica que execute maneje campos opcionales correctamente.
   */
  it('debería llamar al servicio con solo el título si content es undefined', async () => {
    // Arrange
    const noteId = '123';
    const title = 'Solo título';
    const mockNote = new Note(
      noteId,
      title,
      'contenido anterior',
      new Date(),
      new Date(),
    );
    mockNotesService.update!.mockResolvedValue(mockNote);

    // Act
    const result = await useCase.execute(noteId, title, undefined);

    // Assert
    expect(mockNotesService.update!).toHaveBeenCalledWith(
      noteId,
      title,
      undefined,
    );
    expect(result).toEqual(mockNote);
  });
});
