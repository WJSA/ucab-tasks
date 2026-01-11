# Suite de Pruebas - UCAB Tasks

Este directorio contiene todas las pruebas automatizadas del proyecto UCAB Tasks.

## 📋 Tipos de Pruebas

### 1. Pruebas Unitarias

**Ubicación**: `src/**/*.spec.ts`

Las pruebas unitarias validan la lógica de negocio de forma aislada usando mocks.

#### NotesService (`src/application/services/notes.service.spec.ts`)

Valida las reglas de negocio:

- ✅ **findAll**: Verifica que devuelva notas sin el campo `content`
- ✅ **update**: Verifica que establezca `updatedAt` automáticamente
- ✅ **delete**: Verifica que maneje tanto `string` como `array de strings`
- ✅ **create**: Verifica la creación correcta de notas
- ✅ **findById**: Verifica la búsqueda por ID

**Cobertura esperada**: >90%

### 2. Pruebas E2E (End-to-End)

**Ubicación**: `test/*.e2e-spec.ts`

Las pruebas E2E validan el comportamiento completo de los endpoints HTTP.

#### NotesController (`test/notes.e2e-spec.ts`)

Valida los endpoints REST:

**Caminos Felices (Happy Paths)**:
- ✅ POST /notes - Crear nota
- ✅ GET /notes - Listar notas (sin `content`)
- ✅ GET /notes/:id - Obtener nota completa (con `content`)
- ✅ PATCH /notes/:id - Actualizar nota
- ✅ DELETE /notes - Eliminar notas

**Caminos Tristes (Sad Paths)**:
- ✅ 400 - Datos inválidos (validaciones)
- ✅ 404 - Nota no encontrada
- ✅ 400 - Array vacío en eliminación

**Flujo Completo**:
- ✅ Crear → Listar → Obtener → Actualizar → Eliminar

## 🚀 Comandos de Prueba

### Ejecutar Todas las Pruebas

```bash
npm test
```

Ejecuta todas las pruebas unitarias una vez.

### Modo Watch (Desarrollo)

```bash
npm run test:watch
```

Ejecuta las pruebas en modo watch. Útil durante el desarrollo:
- Detecta cambios automáticamente
- Re-ejecuta solo las pruebas afectadas
- Modo interactivo

### Pruebas E2E

```bash
npm run test:e2e
```

Ejecuta solo las pruebas end-to-end.

### Cobertura de Código

```bash
npm run test:cov
```

Genera un reporte completo de cobertura:
- Archivo HTML en `coverage/lcov-report/index.html`
- Resumen en consola
- Archivos LCOV para herramientas de CI/CD

### Modo Debug

```bash
npm run test:debug
```

Ejecuta las pruebas en modo debug para usar con un debugger.

## 📊 Reporte de Cobertura

Después de ejecutar `npm run test:cov`, se genera un reporte en:

```
coverage/
├── lcov-report/           # Reporte HTML interactivo
│   └── index.html        # Abrir en navegador
├── coverage-final.json    # Datos raw de cobertura
└── lcov.info             # Formato LCOV para CI/CD
```

### Umbrales de Cobertura

El proyecto está configurado con los siguientes umbrales mínimos:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Si la cobertura cae por debajo de estos umbrales, las pruebas fallarán.

## 🎯 Reglas de Negocio Validadas

### 1. Listado sin Content

**Archivo**: `notes.service.spec.ts`

```typescript
it('debería devolver notas sin el campo content', async () => {
  // Valida que el listado NO incluya el campo 'content'
  result.forEach((note) => {
    expect(note).not.toHaveProperty('content');
  });
});
```

**Por qué**: Optimización de respuesta HTTP. El contenido completo solo se envía al consultar una nota específica.

### 2. updatedAt Automático

**Archivo**: `notes.service.spec.ts`

```typescript
it('debería establecer updatedAt automáticamente', async () => {
  // Valida que updatedAt se establezca automáticamente al actualizar
  expect(mockRepository.update).toHaveBeenCalledWith(noteId, {
    title,
    content,
    updatedAt: expect.any(Date),
  });
});
```

**Por qué**: El cliente no debe enviar `updatedAt`. El sistema lo gestiona automáticamente.

### 3. Delete Flexible

**Archivo**: `notes.service.spec.ts`

```typescript
it('debería manejar un solo ID (string)', async () => {
  // Valida que delete acepte tanto string como array
  await service.delete('1');
  expect(mockRepository.delete).toHaveBeenCalledWith(['1']);
});
```

**Por qué**: API más flexible. Permite eliminar una nota o múltiples notas con el mismo método.

## 🧪 Estructura de las Pruebas

Todas las pruebas siguen el patrón **AAA**:

### Arrange (Preparar)
```typescript
// Preparar datos de prueba y mocks
const mockNote = new Note('1', 'Título', 'Contenido', new Date(), new Date());
mockRepository.findById.mockResolvedValue(mockNote);
```

### Act (Actuar)
```typescript
// Ejecutar el método a probar
const result = await service.findById('1');
```

### Assert (Verificar)
```typescript
// Verificar resultados y comportamiento
expect(result).toEqual(mockNote);
expect(mockRepository.findById).toHaveBeenCalledWith('1');
```

## 📝 Convenciones de Nomenclatura

### Describe Blocks

- Nombre del módulo/clase: `describe('NotesService', ...)`
- Nombre del método: `describe('findAll', ...)`
- Escenario: `describe('cuando el filtro tiene título', ...)`

### Test Cases

- **Caminos felices**: `it('debería [resultado esperado]', ...)`
- **Caminos tristes**: `it('debería rechazar/fallar cuando [condición]', ...)`
- **Códigos HTTP**: Incluir código en paréntesis: `(200)`, `(404)`, `(400)`

**Ejemplos**:
```typescript
it('debería crear una nota con datos válidos (201)', ...)
it('debería devolver 404 si la nota no existe', ...)
it('debería rechazar crear nota sin título (400)', ...)
```

## 🎨 JSDoc en Pruebas

Todas las pruebas incluyen JSDoc explicando:

- **@description**: Qué valida el grupo de pruebas
- **@remarks**: Detalles importantes sobre la prueba
- **@example**: Ejemplo de uso (si aplica)

```typescript
/**
 * Prueba que findAll devuelva notas sin el campo 'content'.
 *
 * @remarks
 * Esta es una regla de negocio importante: el listado general
 * no debe incluir el contenido completo de las notas.
 */
it('debería devolver notas sin el campo content', ...)
```

## 🔧 Configuración de Pruebas

### Jest Config (`package.json`)

```json
{
  "jest": {
    "testRegex": ".*\\.spec\\.ts$",
    "collectCoverageFrom": ["**/*.ts", "!**/*.spec.ts"],
    "coverageDirectory": "../coverage",
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### E2E Config (`test/jest-e2e.json`)

Configuración específica para pruebas E2E.

## 🐛 Solución de Problemas

### Las pruebas fallan con errores de timeout

```bash
# Aumentar el timeout en el test
jest.setTimeout(30000); // 30 segundos
```

### Error de conexión a MongoDB en E2E

Asegúrate de que MongoDB esté corriendo:

```bash
# Verificar MongoDB
mongosh

# O iniciar con Docker
docker run -d -p 27017:27017 mongo:latest
```

### Cobertura baja

Ejecuta con verbose para ver qué archivos faltan:

```bash
npm run test:cov -- --verbose
```

## 📈 Mejores Prácticas

1. ✅ **Pruebas independientes**: Cada prueba debe poder ejecutarse sola
2. ✅ **Datos de prueba aislados**: No compartir datos entre pruebas
3. ✅ **Limpieza**: Limpiar datos después de cada prueba
4. ✅ **Mocks apropiados**: Mockear dependencias externas
5. ✅ **Nombres descriptivos**: Los nombres deben explicar qué se prueba
6. ✅ **Un assert por concepto**: Agrupar asserts relacionados
7. ✅ **Pruebas rápidas**: Las unitarias deben ser < 100ms

## 🎯 Checklist de Nuevas Funcionalidades

Al agregar una nueva funcionalidad:

- [ ] Escribir pruebas unitarias para la lógica de negocio
- [ ] Escribir pruebas E2E para los nuevos endpoints
- [ ] Probar caminos felices Y tristes
- [ ] Verificar cobertura > 70%
- [ ] Documentar con JSDoc
- [ ] Ejecutar `npm run test:cov` y verificar umbrales

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)

## ✅ Estado Actual

- ✅ Pruebas unitarias: NotesService
- ✅ Pruebas E2E: NotesController (5 endpoints)
- ✅ Cobertura configurada
- ✅ Umbrales definidos (70%)
- ✅ Documentación completa con JSDoc

