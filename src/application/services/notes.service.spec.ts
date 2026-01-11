import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { Note } from '../../domain/entities/note.entity';
import { NoteFilter } from '../../domain/types/note-filter.type';

describe('NotesService', () => {
  let service: NotesService;
  let mockRepository: jest.Mocked<INoteRepository>;

  /**
   * Configuración inicial antes de cada prueba.
   * Crea un módulo de prueba con el servicio y un mock del repositorio.
   */
  beforeEach(async () => {
    // Mock del repositorio con todas sus funciones
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: 'NoteRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  /**
   * Verifica que el servicio se haya creado correctamente.
   */
  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  /**
   * Grupo de pruebas para el método findAll.
   *
   * @description
   * Valida que el método findAll:
   * - Llame al repositorio con los filtros correctos
   * - Devuelva las notas SIN el campo 'content' (regla de negocio)
   * - Mantenga los demás campos (id, title, createdAt, updatedAt)
   */
  describe('findAll', () => {
    /**
     * Prueba que findAll devuelva notas sin el campo 'content'.
     *
     * @remarks
     * Esta es una regla de negocio importante: el listado general
     * no debe incluir el contenido completo de las notas para optimizar
     * la respuesta.
     */
    it('debería devolver notas sin el campo content', async () => {
      // Arrange: Preparar datos de prueba
      const mockNotes: Note[] = [
        new Note(
          '1',
          'Nota 1',
          'Contenido secreto 1',
          new Date('2024-01-01'),
          new Date('2024-01-01'),
        ),
        new Note(
          '2',
          'Nota 2',
          'Contenido secreto 2',
          new Date('2024-01-02'),
          new Date('2024-01-02'),
        ),
      ];

      const filter: NoteFilter = { sortBy: 'createdAt', sortOrder: 'DESC' };
      mockRepository.findAll.mockResolvedValue(mockNotes);

      // Act: Ejecutar el método
      const result = await service.findAll(filter);

      // Assert: Verificar resultados
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toHaveLength(2);

      // Verificar que NO tenga el campo 'content'
      for (const note of result) {
        expect(note).not.toHaveProperty('content');
        expect(note).toHaveProperty('id');
        expect(note).toHaveProperty('title');
        expect(note).toHaveProperty('createdAt');
        expect(note).toHaveProperty('updatedAt');
      }
    });

    /**
     * Prueba que findAll pase correctamente los filtros al repositorio.
     */
    it('debería pasar los filtros correctamente al repositorio', async () => {
      // Arrange
      const filter: NoteFilter = {
        title: 'importante',
        sortBy: 'title',
        sortOrder: 'ASC',
      };
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      await service.findAll(filter);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  /**
   * Grupo de pruebas para el método findById.
   *
   * @description
   * Valida que el método findById:
   * - Llame al repositorio con el ID correcto
   * - Devuelva la nota completa (CON el campo 'content')
   */
  describe('findById', () => {
    /**
     * Prueba que findById devuelva la nota completa incluyendo content.
     */
    it('debería devolver la nota completa con todos los campos', async () => {
      // Arrange
      const mockNote = new Note(
        '1',
        'Nota completa',
        'Contenido completo',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );
      mockRepository.findById.mockResolvedValue(mockNote);

      // Act
      const result = await service.findById('1');

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNote);
      expect(result.content).toBe('Contenido completo');
    });
  });

  /**
   * Grupo de pruebas para el método create.
   *
   * @description
   * Valida que el método create:
   * - Llame al repositorio con los datos correctos
   * - Devuelva la nota creada
   */
  describe('create', () => {
    /**
     * Prueba que create llame al repositorio con los datos correctos.
     */
    it('debería crear una nota con título y contenido', async () => {
      // Arrange
      const title = 'Nueva nota';
      const content = 'Contenido de la nota';
      const mockNote = new Note('1', title, content, new Date(), new Date());
      mockRepository.create.mockResolvedValue(mockNote);

      // Act
      const result = await service.create(title, content);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).toHaveBeenCalledWith({ title, content });
      expect(result).toEqual(mockNote);
    });
  });

  /**
   * Grupo de pruebas para el método update.
   *
   * @description
   * Valida que el método update:
   * - Establezca automáticamente el campo 'updatedAt' a la fecha actual
   * - Solo actualice los campos proporcionados
   * - Llame al repositorio correctamente
   */
  describe('update', () => {
    /**
     * Prueba que update establezca automáticamente updatedAt a la fecha actual.
     *
     * @remarks
     * Esta es una regla de negocio crítica: el campo updatedAt debe
     * actualizarse automáticamente sin que el cliente lo envíe.
     */
    it('debería establecer updatedAt automáticamente a la fecha actual', async () => {
      // Arrange
      const noteId = '1';
      const title = 'Título actualizado';
      const content = 'Contenido actualizado';

      const now = new Date();
      jest.spyOn(global, 'Date').mockImplementation((() => now) as never);

      const mockUpdatedNote = new Note(
        noteId,
        title,
        content,
        new Date('2024-01-01'),
        now,
      );
      mockRepository.update.mockResolvedValue(mockUpdatedNote);

      // Act
      await service.update(noteId, title, content);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.update).toHaveBeenCalledWith(noteId, {
        title,
        content,
        updatedAt: now,
      });
    });

    /**
     * Prueba que update solo actualice el título si solo se proporciona título.
     */
    it('debería actualizar solo el título si solo se proporciona título', async () => {
      // Arrange
      const noteId = '1';
      const title = 'Nuevo título';
      const mockNote = new Note(
        noteId,
        title,
        'contenido anterior',
        new Date('2024-01-01'),
        new Date(),
      );
      mockRepository.update.mockResolvedValue(mockNote);

      // Act
      await service.update(noteId, title, undefined);

      // Assert
      const callArgs = mockRepository.update.mock.calls[0][1];
      expect(callArgs).toHaveProperty('title', title);
      expect(callArgs).toHaveProperty('updatedAt');
      expect(callArgs).not.toHaveProperty('content');
    });

    /**
     * Prueba que update solo actualice el contenido si solo se proporciona contenido.
     */
    it('debería actualizar solo el contenido si solo se proporciona contenido', async () => {
      // Arrange
      const noteId = '1';
      const content = 'Nuevo contenido';
      const mockNote = new Note(
        noteId,
        'título anterior',
        content,
        new Date('2024-01-01'),
        new Date(),
      );
      mockRepository.update.mockResolvedValue(mockNote);

      // Act
      await service.update(noteId, undefined, content);

      // Assert
      const callArgs = mockRepository.update.mock.calls[0][1];
      expect(callArgs).toHaveProperty('content', content);
      expect(callArgs).toHaveProperty('updatedAt');
      expect(callArgs).not.toHaveProperty('title');
    });
  });

  /**
   * Grupo de pruebas para el método delete.
   *
   * @description
   * Valida que el método delete:
   * - Maneje correctamente un string individual
   * - Maneje correctamente un array de strings
   * - Normalice internamente a array antes de llamar al repositorio
   */
  describe('delete', () => {
    /**
     * Prueba que delete maneje correctamente un solo ID (string).
     *
     * @remarks
     * El método debe aceptar tanto un string como un array de strings
     * y normalizarlos internamente a array.
     */
    it('debería manejar un solo ID (string) y convertirlo a array', async () => {
      // Arrange
      const noteId = '1';
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(noteId);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.delete).toHaveBeenCalledWith([noteId]);
    });

    /**
     * Prueba que delete maneje correctamente un array de IDs.
     */
    it('debería manejar un array de IDs correctamente', async () => {
      // Arrange
      const noteIds = ['1', '2', '3'];
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(noteIds);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.delete).toHaveBeenCalledWith(noteIds);
    });

    /**
     * Prueba que delete maneje un array con un solo elemento.
     */
    it('debería manejar un array con un solo elemento', async () => {
      // Arrange
      const noteIds = ['1'];
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete(noteIds);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.delete).toHaveBeenCalledWith(noteIds);
    });
  });
});
