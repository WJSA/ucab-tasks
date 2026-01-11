# Servicios de Aplicación

Esta carpeta contiene los servicios que encapsulan la lógica de negocio de la aplicación.

## NotesService

El `NotesService` es el servicio principal que maneja toda la lógica de negocio relacionada con las notas.

### Responsabilidades

1. **Encapsular la lógica de negocio**: Toda la lógica de negocio está centralizada en el servicio
2. **Aplicar reglas de negocio**: Valida y transforma datos según las reglas del dominio
3. **Interactuar con el repositorio**: Usa la interfaz `INoteRepository` a través de inyección de dependencias

### Reglas de Negocio Implementadas

#### 1. Listar Notas (findAll)

```typescript
async findAll(filter: NoteFilter): Promise<NoteListItem[]>
```

- **Regla**: Omite el campo `content` en los resultados para optimizar la respuesta
- **Soporte**: Filtrado por título y ordenamiento (title, createdAt, updatedAt)
- **Retorna**: Solo `id`, `title`, `createdAt`, `updatedAt`

#### 2. Obtener Nota por ID (findById)

```typescript
async findById(id: string): Promise<Note>
```

- **Regla**: Retorna el objeto completo incluyendo el campo `content`
- **Lanza**: `NotFoundException` si la nota no existe

#### 3. Crear Nota (create)

```typescript
async create(title: string, content: string): Promise<Note>
```

- Delega la creación al repositorio
- El repositorio establece automáticamente `id`, `createdAt` y `updatedAt`

#### 4. Actualizar Nota (update)

```typescript
async update(id: string, title?: string, content?: string): Promise<Note>
```

- **Regla**: Establece automáticamente `updatedAt` a la fecha actual
- Solo actualiza los campos proporcionados
- **Lanza**: `NotFoundException` si la nota no existe

#### 5. Eliminar Notas (delete)

```typescript
async delete(ids: string | string[]): Promise<void>
```

- **Regla**: Acepta tanto un solo ID como un array de IDs
- Normaliza automáticamente un ID individual a array
- **Lanza**: `NotFoundException` si alguna nota no existe

### Uso en Casos de Uso

Los casos de uso utilizan el servicio para ejecutar operaciones:

```typescript
@Injectable()
export class CreateNoteUseCase {
  constructor(private readonly notesService: NotesService) {}

  async execute(title: string, content: string): Promise<Note> {
    return await this.notesService.create(title, content);
  }
}
```

### Inyección de Dependencias

El servicio recibe el repositorio a través de inyección de dependencias:

```typescript
constructor(
  @Inject('NoteRepository')
  private readonly noteRepository: INoteRepository,
) {}
```

Esto permite:
- **Testabilidad**: Fácil crear mocks del repositorio
- **Flexibilidad**: Cambiar la implementación del repositorio sin modificar el servicio
- **Inversión de dependencias**: El servicio depende de la abstracción (INoteRepository), no de la implementación

### Tipo NoteListItem

El servicio exporta el tipo `NoteListItem` para representar notas sin el campo `content`:

```typescript
export interface NoteListItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Este tipo se usa en el método `findAll()` para garantizar que el campo `content` nunca se exponga en listados.

## Beneficios

1. **Separación de responsabilidades**: La lógica de negocio está separada de los controladores y repositorios
2. **Reutilización**: Los casos de uso pueden reutilizar la lógica del servicio
3. **Testabilidad**: Fácil de testear de forma unitaria
4. **Mantenibilidad**: Cambios en la lógica de negocio se hacen en un solo lugar
5. **Validación centralizada**: Las reglas de negocio se aplican consistentemente

