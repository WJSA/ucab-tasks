import { Test, TestingModule } from '@nestjs/testing';
import { GetAllNotesUseCase } from './get-all-notes.use-case';
import { NotesService } from '../services/notes.service';
import { NoteFilter } from '../../domain/types/note-filter.type';

/**
 * Pruebas unitarias para GetAllNotesUseCase.
 *
 * @description
 * Valida que el caso de uso delegue correctamente la obtención
 * de todas las notas al servicio de aplicación.
 */
describe('GetAllNotesUseCase', () => {
  let useCase: GetAllNotesUseCase;
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
        GetAllNotesUseCase,
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    useCase = module.get<GetAllNotesUseCase>(GetAllNotesUseCase);
  });

  /**
   * Verifica que el caso de uso esté definido correctamente.
   */
  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  /**
   * Verifica que execute llame al servicio con el filtro correcto.
   *
   * @remarks
   * El caso de uso debe pasar el filtro al servicio sin modificarlo.
   */
  it('debería llamar al servicio con el filtro proporcionado', async () => {
    // Arrange
    const filter: NoteFilter = {
      title: 'test',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    const mockResult = [
      { id: '1', title: 'test', createdAt: new Date(), updatedAt: new Date() },
    ];
    mockNotesService.findAll!.mockResolvedValue(mockResult);

    // Act
    const result = await useCase.execute(filter);

    // Assert
    expect(mockNotesService.findAll!).toHaveBeenCalledWith(filter);
    expect(result).toEqual(mockResult);
  });
});
