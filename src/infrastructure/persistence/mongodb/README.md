# Persistencia con MongoDB

Esta carpeta contiene la implementación de persistencia usando MongoDB y Mongoose.

## 📁 Estructura

```
mongodb/
├── schemas/                    # Esquemas de Mongoose
│   └── note.schema.ts         # Esquema de Note
├── repositories/              # Implementaciones de repositorios
│   └── mongo-note.repository.ts
├── database.module.ts         # Configuración de MongoDB
└── README.md                  # Este archivo
```

## 🗄️ Componentes

### 1. NoteSchema

**Archivo**: `schemas/note.schema.ts`

Esquema de Mongoose que define la estructura de los documentos de notas en MongoDB.

**Características**:
- ✅ Timestamps automáticos (`createdAt`, `updatedAt`)
- ✅ Validaciones a nivel de esquema
- ✅ Índices para optimizar búsquedas
- ✅ Mapeo del `_id` de MongoDB al `id` de la entidad

```typescript
@Schema({
  collection: 'notes',
  timestamps: true,
  versionKey: false,
})
export class NoteDocument extends Document {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ required: true })
  content: string;

  createdAt: Date;
  updatedAt: Date;
}
```

**Índices**:
- `title`: Para búsquedas por título
- `createdAt`: Para ordenamiento por fecha de creación
- `updatedAt`: Para ordenamiento por fecha de actualización

### 2. MongoNoteRepository

**Archivo**: `repositories/mongo-note.repository.ts`

Implementación de `INoteRepository` usando Mongoose para interactuar con MongoDB.

**Métodos Implementados**:

#### findAll(filter: NoteFilter): Promise<Note[]>

Busca notas con filtrado y ordenamiento.

```typescript
// Filtrar por título
await repository.findAll({ title: 'importante' });

// Ordenar por fecha de creación descendente
await repository.findAll({ sortBy: 'createdAt', sortOrder: 'DESC' });

// Combinar filtrado y ordenamiento
await repository.findAll({
  title: 'trabajo',
  sortBy: 'updatedAt',
  sortOrder: 'ASC'
});
```

**Características**:
- ✅ Búsqueda parcial por título (case-insensitive)
- ✅ Ordenamiento por `title`, `createdAt` o `updatedAt`
- ✅ Dirección ASC/DESC
- ✅ Usa índices de MongoDB para rendimiento óptimo

#### findById(id: string): Promise<Note>

Busca una nota por su ID.

```typescript
const note = await repository.findById('507f1f77bcf86cd799439011');
```

**Características**:
- ✅ Lanza `NotFoundException` si no existe
- ✅ Convierte ObjectId a string

#### create(noteData: Partial<Note>): Promise<Note>

Crea una nueva nota.

```typescript
const note = await repository.create({
  title: 'Mi nota',
  content: 'Contenido'
});
```

**Características**:
- ✅ MongoDB genera el `_id` automáticamente
- ✅ Mongoose gestiona `createdAt` y `updatedAt`

#### update(id: string, noteData: Partial<Note>): Promise<Note>

Actualiza una nota existente.

```typescript
const note = await repository.update('507f1f77bcf86cd799439011', {
  title: 'Nuevo título'
});
```

**Características**:
- ✅ Solo actualiza campos proporcionados
- ✅ Ejecuta validaciones del esquema
- ✅ Retorna documento actualizado
- ✅ Lanza `NotFoundException` si no existe

#### delete(ids: string[]): Promise<void>

Elimina una o varias notas.

```typescript
// Eliminar una nota
await repository.delete(['507f1f77bcf86cd799439011']);

// Eliminar múltiples notas
await repository.delete([
  '507f1f77bcf86cd799439011',
  '507f191e810c19729de860ea'
]);
```

**Características**:
- ✅ Validación previa (todas las notas deben existir)
- ✅ Operación atómica
- ✅ Lanza `NotFoundException` con IDs faltantes

### 3. DatabaseModule

**Archivo**: `database.module.ts`

Módulo que configura la conexión a MongoDB y expone los repositorios.

**Configuración**:
```typescript
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/ucab-tasks'
    ),
    MongooseModule.forFeature([
      { name: NoteDocument.name, schema: NoteSchema }
    ]),
  ],
  providers: [MongoNoteRepository],
  exports: [MongoNoteRepository],
})
export class DatabaseModule {}
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# MongoDB local
MONGO_URI=mongodb://localhost:27017/ucab-tasks

# MongoDB Atlas (ejemplo)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ucab-tasks?retryWrites=true&w=majority
```

### Instalar MongoDB Localmente

#### Ubuntu/Debian
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### macOS (con Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Verificar Conexión

```bash
# Conectar con el cliente de MongoDB
mongosh

# Ver bases de datos
show dbs

# Usar la base de datos
use ucab-tasks

# Ver colecciones
show collections
```

## 🔄 Integración con NotesModule

El `NotesModule` usa un **provider personalizado** para inyectar el repositorio:

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'NoteRepository',
      useExisting: MongoNoteRepository, // ✅ Inyecta MongoNoteRepository
    },
    NotesService,
    // ... casos de uso
  ],
})
export class NotesModule {}
```

**Ventajas**:
- ✅ El servicio depende de la abstracción (`INoteRepository`)
- ✅ Fácil cambiar entre implementaciones (MongoDB ↔ In-Memory)
- ✅ Testeable (fácil crear mocks)

## 🧪 Cambiar entre Implementaciones

Para cambiar a la implementación en memoria:

```typescript
// En NotesModule
{
  provide: 'NoteRepository',
  useClass: InMemoryNoteRepository, // En lugar de useExisting: MongoNoteRepository
}
```

Y eliminar la importación de `DatabaseModule`.

## 📊 Índices y Rendimiento

Los índices se definen en el esquema:

```typescript
NoteSchema.index({ title: 1 });        // Búsquedas por título
NoteSchema.index({ createdAt: -1 });   // Ordenamiento por creación
NoteSchema.index({ updatedAt: -1 });   // Ordenamiento por actualización
```

**Ventajas**:
- ✅ Búsquedas más rápidas
- ✅ Ordenamiento optimizado
- ✅ Mejor rendimiento con grandes volúmenes

## 🔍 Queries de Mongoose Usadas

### Filtrado con Regex (case-insensitive)
```typescript
query.title = { $regex: filter.title, $options: 'i' };
```

### Ordenamiento
```typescript
sort[filter.sortBy] = filter.sortOrder === 'DESC' ? -1 : 1;
```

### Búsqueda por ID
```typescript
await this.noteModel.findById(id).exec();
```

### Actualización con validación
```typescript
await this.noteModel.findByIdAndUpdate(
  id,
  { $set: noteData },
  { new: true, runValidators: true }
).exec();
```

### Eliminación múltiple
```typescript
await this.noteModel.deleteMany({ _id: { $in: ids } }).exec();
```

## 🎯 Mapeo Documento ↔ Entidad

El método privado `mapToEntity` convierte documentos de MongoDB a entidades del dominio:

```typescript
private mapToEntity(document: NoteDocument): Note {
  return new Note(
    document._id.toString(), // ObjectId → string
    document.title,
    document.content,
    document.createdAt,
    document.updatedAt,
  );
}
```

**Características**:
- ✅ Convierte `_id` (ObjectId) a string
- ✅ Mantiene la separación entre infraestructura y dominio
- ✅ El dominio no conoce MongoDB

## 📝 JSDoc

Todos los métodos públicos están documentados con JSDoc:

```typescript
/**
 * Obtiene todas las notas aplicando filtros y ordenamiento.
 *
 * @param {NoteFilter} filter - Objeto con criterios de filtrado y ordenamiento
 * @returns {Promise<Note[]>} Array de notas que cumplen los criterios
 *
 * @example
 * ```typescript
 * const notes = await repository.findAll({
 *   title: 'importante',
 *   sortBy: 'createdAt',
 *   sortOrder: 'DESC'
 * });
 * ```
 */
async findAll(filter: NoteFilter): Promise<Note[]> { ... }
```

## ✅ Ventajas de esta Implementación

1. **Arquitectura Hexagonal**: El dominio no depende de MongoDB
2. **Testeable**: Fácil crear mocks del repositorio
3. **Intercambiable**: Cambiar entre MongoDB e In-Memory sin tocar el dominio
4. **Documentado**: JSDoc completo en todos los métodos
5. **Optimizado**: Índices para búsquedas rápidas
6. **Validaciones**: A nivel de esquema de Mongoose
7. **Timestamps Automáticos**: Mongoose gestiona createdAt/updatedAt
8. **Type-Safe**: TypeScript en toda la implementación

## 🚀 Próximos Pasos

- Agregar transacciones para operaciones complejas
- Implementar paginación en `findAll`
- Agregar caché (Redis)
- Configurar réplicas para alta disponibilidad
- Implementar soft delete

