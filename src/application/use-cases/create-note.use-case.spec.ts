import { Test, TestingModule } from '@nestjs/testing';
import { CreateNoteUseCase } from './create-note.use-case';
import { NotesService } from '../services/notes.service';
import { Note } from '../../domain/entities/note.entity';

/**
 * Pruebas unitarias para CreateNoteUseCase.
 *
 * @description
 * Valida que el caso de uso delegue correctamente la creación
 * de notas al servicio de aplicación.
 */
describe('CreateNoteUseCase', () => {
  let useCase: CreateNoteUseCase;
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
        CreateNoteUseCase,
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    useCase = module.get<CreateNoteUseCase>(CreateNoteUseCase);
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
   * El caso de uso debe actuar como un simple delegador,
   * pasando los parámetros al servicio sin transformarlos.
   */
  it('debería llamar al servicio con título y contenido', async () => {
    // Arrange
    const title = 'Nueva nota';
    const content = 'Contenido de la nota';
    const mockNote = new Note('1', title, content, new Date(), new Date());
    mockNotesService.create!.mockResolvedValue(mockNote);

    // Act
    const result = await useCase.execute(title, content);

    // Assert
    expect(mockNotesService.create!).toHaveBeenCalledWith(title, content);
    expect(result).toEqual(mockNote);
  });
});
