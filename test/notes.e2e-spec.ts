import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Interfaces para tipar las respuestas de la API
 */
interface NoteResponse {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  message: string | string[];
  statusCode: number;
  error?: string;
}

/**
 * Suite de pruebas E2E para los endpoints de notas.
 *
 * @description
 * Estas pruebas validan el comportamiento completo de los endpoints,
 * incluyendo:
 * - Caminos felices (happy paths): operaciones exitosas
 * - Caminos tristes (sad paths): manejo de errores (404, 400)
 * - Validaciones de datos
 * - Respuestas HTTP correctas
 *
 * @remarks
 * Las pruebas se ejecutan en orden para validar el flujo completo:
 * 1. Crear notas
 * 2. Listar notas
 * 3. Obtener nota específica
 * 4. Actualizar nota
 * 5. Eliminar notas
 */
describe('NotesController (E2E)', () => {
  let app: INestApplication;
  let createdNoteId: string;
  let createdNoteId2: string;

  /**
   * Configuración inicial antes de todas las pruebas.
   * Crea la aplicación NestJS con todos sus módulos.
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar ValidationPipe como en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  /**
   * Limpieza después de todas las pruebas.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * Grupo de pruebas para POST /notes (Crear nota).
   *
   * @description
   * Valida la creación de notas tanto en caminos felices como tristes.
   */
  describe('POST /notes (Crear nota)', () => {
    /**
     * CAMINO FELIZ: Crear una nota con datos válidos.
     *
     * @remarks
     * Valida que:
     * - El endpoint responda con código 201 (Created)
     * - La nota tenga un ID generado automáticamente
     * - Los campos createdAt y updatedAt se generen automáticamente
     * - Los datos coincidan con los enviados
     */
    it('debería crear una nota con datos válidos (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'Nota de prueba E2E',
          content: 'Contenido de la nota de prueba',
        })
        .expect(201);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('title', 'Nota de prueba E2E');
      expect(body).toHaveProperty('content', 'Contenido de la nota de prueba');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');

      // Guardar el ID para pruebas posteriores
      createdNoteId = body.id;
    });

    /**
     * Crear una segunda nota para pruebas de listado y eliminación múltiple.
     */
    it('debería crear una segunda nota (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'Segunda nota de prueba',
          content: 'Contenido de la segunda nota',
        })
        .expect(201);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('id');
      createdNoteId2 = body.id;
    });

    /**
     * CAMINO TRISTE: Intentar crear una nota sin título.
     *
     * @remarks
     * Valida que el ValidationPipe rechace datos inválidos con código 400.
     */
    it('debería rechazar crear nota sin título (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/notes')
        .send({
          content: 'Solo contenido, sin título',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body).toHaveProperty('message');
      expect(body.statusCode).toBe(400);
    });

    /**
     * CAMINO TRISTE: Intentar crear una nota sin contenido.
     */
    it('debería rechazar crear nota sin contenido (400)', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'Solo título',
        })
        .expect(400);
    });

    /**
     * CAMINO TRISTE: Intentar crear una nota con título vacío.
     */
    it('debería rechazar crear nota con título vacío (400)', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: '',
          content: 'Contenido válido',
        })
        .expect(400);
    });

    /**
     * CAMINO TRISTE: Intentar crear una nota con título demasiado largo.
     */
    it('debería rechazar crear nota con título mayor a 100 caracteres (400)', async () => {
      await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'a'.repeat(101), // 101 caracteres
          content: 'Contenido válido',
        })
        .expect(400);
    });
  });

  /**
   * Grupo de pruebas para GET /notes (Listar notas).
   *
   * @description
   * Valida el listado de notas con y sin filtros.
   */
  describe('GET /notes (Listar notas)', () => {
    /**
     * CAMINO FELIZ: Obtener todas las notas.
     *
     * @remarks
     * Valida que:
     * - El endpoint responda con código 200
     * - Devuelva un array de notas
     * - Las notas NO contengan el campo 'content' (regla de negocio)
     */
    it('debería obtener todas las notas sin el campo content (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .expect(200);

      const body = response.body as NoteResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(2);

      // Verificar que NO tenga el campo 'content'
      body.forEach((note) => {
        expect(note).toHaveProperty('id');
        expect(note).toHaveProperty('title');
        expect(note).toHaveProperty('createdAt');
        expect(note).toHaveProperty('updatedAt');
        expect(note).not.toHaveProperty('content'); // Regla de negocio
      });
    });

    /**
     * CAMINO FELIZ: Filtrar notas por título.
     */
    it('debería filtrar notas por título (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes?title=prueba')
        .expect(200);

      const body = response.body as NoteResponse[];
      expect(Array.isArray(body)).toBe(true);
      // Todas las notas devueltas deben contener "prueba" en el título
      body.forEach((note) => {
        expect(note.title.toLowerCase()).toContain('prueba');
      });
    });

    /**
     * CAMINO FELIZ: Ordenar notas por fecha de creación descendente.
     */
    it('debería ordenar notas por createdAt DESC (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes?sortBy=createdAt&sortOrder=DESC')
        .expect(200);

      const body = response.body as NoteResponse[];
      expect(Array.isArray(body)).toBe(true);
      // Verificar que estén ordenadas descendentemente
      if (body.length > 1) {
        const firstDate = new Date(body[0].createdAt);
        const secondDate = new Date(body[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(
          secondDate.getTime(),
        );
      }
    });
  });

  /**
   * Grupo de pruebas para GET /notes/:id (Obtener nota por ID).
   *
   * @description
   * Valida la obtención de una nota específica por su ID.
   */
  describe('GET /notes/:id (Obtener nota por ID)', () => {
    /**
     * CAMINO FELIZ: Obtener una nota existente por ID.
     *
     * @remarks
     * Valida que:
     * - El endpoint responda con código 200
     * - La nota contenga TODOS los campos, incluyendo 'content'
     */
    it('debería obtener una nota por ID con todos los campos incluido content (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('id', createdNoteId);
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('content'); // Debe incluir content
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
    });

    /**
     * CAMINO TRISTE: Intentar obtener una nota con ID inexistente.
     *
     * @remarks
     * Valida que el endpoint responda con código 404 (Not Found).
     */
    it('debería devolver 404 si la nota no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999'; // ID válido pero inexistente
      const response = await request(app.getHttpServer())
        .get(`/notes/${nonExistentId}`)
        .expect(404);

      const body = response.body as ErrorResponse;
      expect(body).toHaveProperty('message');
      expect(body.statusCode).toBe(404);
    });
  });

  /**
   * Grupo de pruebas para PATCH /notes/:id (Actualizar nota).
   *
   * @description
   * Valida la actualización parcial de notas.
   */
  describe('PATCH /notes/:id (Actualizar nota)', () => {
    /**
     * CAMINO FELIZ: Actualizar el título de una nota.
     *
     * @remarks
     * Valida que:
     * - El endpoint responda con código 200
     * - El título se actualice correctamente
     * - El campo updatedAt se actualice automáticamente
     */
    it('debería actualizar el título de una nota (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({
          title: 'Título actualizado',
        })
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('title', 'Título actualizado');
      expect(body).toHaveProperty('updatedAt');
      // Verificar que updatedAt sea diferente a createdAt
      expect(body.updatedAt).not.toBe(body.createdAt);
    });

    /**
     * CAMINO FELIZ: Actualizar el contenido de una nota.
     */
    it('debería actualizar el contenido de una nota (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({
          content: 'Contenido actualizado',
        })
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('content', 'Contenido actualizado');
    });

    /**
     * CAMINO FELIZ: Actualizar título y contenido simultáneamente.
     */
    it('debería actualizar título y contenido simultáneamente (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({
          title: 'Título y contenido actualizados',
          content: 'Nuevo contenido completo',
        })
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body).toHaveProperty('title', 'Título y contenido actualizados');
      expect(body).toHaveProperty('content', 'Nuevo contenido completo');
    });

    /**
     * CAMINO TRISTE: Intentar actualizar una nota inexistente.
     */
    it('debería devolver 404 si la nota a actualizar no existe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      await request(app.getHttpServer())
        .patch(`/notes/${nonExistentId}`)
        .send({
          title: 'Intento de actualización',
        })
        .expect(404);
    });

    /**
     * CAMINO TRISTE: Intentar actualizar con título inválido (demasiado largo).
     */
    it('debería rechazar actualización con título mayor a 100 caracteres (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({
          title: 'a'.repeat(101),
        })
        .expect(400);
    });
  });

  /**
   * Grupo de pruebas para DELETE /notes (Eliminación masiva).
   *
   * @description
   * Valida la eliminación de una o múltiples notas.
   */
  describe('DELETE /notes (Eliminación masiva)', () => {
    /**
     * CAMINO FELIZ: Eliminar múltiples notas.
     *
     * @remarks
     * Valida que:
     * - El endpoint responda con código 204 (No Content)
     * - Las notas se eliminen correctamente
     */
    it('debería eliminar múltiples notas (204)', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({
          ids: [createdNoteId, createdNoteId2],
        })
        .expect(204);
    });

    /**
     * Verificar que las notas fueron eliminadas.
     */
    it('debería confirmar que las notas fueron eliminadas (404)', async () => {
      await request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(404);
    });

    /**
     * CAMINO TRISTE: Intentar eliminar notas con array vacío.
     *
     * @remarks
     * El DTO valida que el array tenga al menos un elemento.
     */
    it('debería rechazar eliminación con array vacío (400)', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({
          ids: [],
        })
        .expect(400);
    });

    /**
     * CAMINO TRISTE: Intentar eliminar notas inexistentes.
     */
    it('debería devolver 404 si alguna nota no existe (404)', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({
          ids: ['507f1f77bcf86cd799439999', '507f1f77bcf86cd799439998'],
        })
        .expect(404);
    });

    /**
     * CAMINO TRISTE: Intentar eliminar sin enviar el campo 'ids'.
     */
    it('debería rechazar eliminación sin el campo ids (400)', async () => {
      await request(app.getHttpServer()).delete('/notes').send({}).expect(400);
    });
  });

  /**
   * Prueba del flujo completo (Camino feliz).
   *
   * @description
   * Valida el flujo completo de operaciones:
   * 1. Crear nota
   * 2. Listar y verificar que aparezca
   * 3. Obtener por ID
   * 4. Actualizar
   * 5. Eliminar
   */
  describe('Flujo completo (Crear → Listar → Actualizar → Eliminar)', () => {
    let flowNoteId: string;

    it('1. Crear nota', async () => {
      const response = await request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'Nota del flujo completo',
          content: 'Contenido inicial',
        })
        .expect(201);

      const body = response.body as NoteResponse;
      flowNoteId = body.id;
      expect(flowNoteId).toBeDefined();
    });

    it('2. Listar notas y verificar que aparezca', async () => {
      const response = await request(app.getHttpServer())
        .get('/notes')
        .expect(200);

      const body = response.body as NoteResponse[];
      const noteExists = body.some((note) => note.id === flowNoteId);
      expect(noteExists).toBe(true);
    });

    it('3. Obtener nota por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/notes/${flowNoteId}`)
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body.id).toBe(flowNoteId);
      expect(body.title).toBe('Nota del flujo completo');
      expect(body.content).toBe('Contenido inicial');
    });

    it('4. Actualizar nota', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/notes/${flowNoteId}`)
        .send({
          title: 'Título modificado en flujo',
        })
        .expect(200);

      const body = response.body as NoteResponse;
      expect(body.title).toBe('Título modificado en flujo');
    });

    it('5. Eliminar nota', async () => {
      await request(app.getHttpServer())
        .delete('/notes')
        .send({
          ids: [flowNoteId],
        })
        .expect(204);

      // Verificar que fue eliminada
      await request(app.getHttpServer())
        .get(`/notes/${flowNoteId}`)
        .expect(404);
    });
  });
});
