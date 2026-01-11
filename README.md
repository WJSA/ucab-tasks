# UCAB Tasks - API REST con Arquitectura Hexagonal

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

**UCAB Tasks** es una API REST para gestión de notas construida con NestJS siguiendo los principios de **Arquitectura Hexagonal** (Ports & Adapters) y **Clean Architecture**.

### ✨ Características

- ✅ Arquitectura Hexagonal con separación de capas
- ✅ Clean Architecture siguiendo principios SOLID
- ✅ Swagger/OpenAPI integrado y documentado
- ✅ Validación automática con class-validator
- ✅ CRUD completo de notas
- ✅ Inyección de dependencias
- ✅ TypeScript puro en el dominio (sin decoradores)

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

### 3. Acceder a Swagger

Abre tu navegador y visita la documentación interactiva:

```
http://localhost:3000/api/docs
```

---

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Arquitectura Hexagonal** y **Clean Architecture**.

### Estructura de Carpetas

```
src/
├── domain/                    # 🔵 CAPA DE DOMINIO
│   ├── entities/             # Entidades del dominio (TypeScript puro)
│   │   └── note.entity.ts
│   └── repositories/         # Interfaces de repositorios (Ports)
│       └── note.repository.interface.ts
│
├── application/              # 🟢 CAPA DE APLICACIÓN
│   └── use-cases/           # Casos de uso (Lógica de negocio)
│       ├── create-note.use-case.ts
│       ├── get-all-notes.use-case.ts
│       ├── get-note-by-id.use-case.ts
│       ├── update-note.use-case.ts
│       └── delete-note.use-case.ts
│
├── infrastructure/           # 🟡 CAPA DE INFRAESTRUCTURA
│   ├── controllers/         # Controladores HTTP (Adapters)
│   │   └── notes.controller.ts
│   ├── dtos/               # Data Transfer Objects
│   │   ├── create-note.dto.ts
│   │   └── update-note.dto.ts
│   ├── persistence/        # Implementación de repositorios
│   │   └── in-memory-note.repository.ts
│   └── notes.module.ts     # Módulo de NestJS
│
├── app.module.ts           # Módulo raíz
└── main.ts                 # Punto de entrada (Swagger + ValidationPipe)
```

### Capas de la Arquitectura

#### 🔵 Capa de Dominio (`domain/`)

- **Entidades**: Objetos de negocio puros sin dependencias externas
- **Interfaces de Repositorios**: Contratos que define el dominio (Ports)
- Sin dependencias de frameworks
- TypeScript puro

#### 🟢 Capa de Aplicación (`application/`)

- **Casos de Uso**: Orquestación de la lógica de negocio
- Depende únicamente de la capa de dominio
- Independiente de frameworks y detalles de implementación

#### 🟡 Capa de Infraestructura (`infrastructure/`)

- **Controladores**: Manejo de peticiones HTTP
- **DTOs**: Validación de datos de entrada
- **Repositorios**: Implementación concreta de persistencia
- Depende de frameworks (NestJS, class-validator, etc.)

### Flujo de Datos

```
HTTP Request
    ↓
Controller (Infrastructure)
    ↓
Use Case (Application)
    ↓
Repository Interface (Domain)
    ↓
Repository Implementation (Infrastructure)
    ↓
Entity (Domain)
    ↓
HTTP Response
```

### Principios SOLID Aplicados

1. **Single Responsibility**: Cada caso de uso tiene una única responsabilidad
2. **Open/Closed**: Fácil extender sin modificar código existente
3. **Liskov Substitution**: Cualquier implementación de repositorio es intercambiable
4. **Interface Segregation**: Interfaces específicas y enfocadas
5. **Dependency Inversion**: Las capas dependen de abstracciones, no de implementaciones

---

## 📡 API Endpoints

### Información General

- **URL Base**: `http://localhost:3000`
- **Documentación Swagger**: `http://localhost:3000/api/docs`

### Endpoints Disponibles

#### 1. Crear una Nota

**POST** `/notes`

```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primera nota",
    "content": "Este es el contenido de mi primera nota"
  }'
```

**Respuesta (201 Created):**
```json
{
  "id": "aa5e0075-d3c9-47bb-bd9d-9eca0f33e08e",
  "title": "Mi primera nota",
  "content": "Este es el contenido de mi primera nota",
  "createdAt": "2026-01-07T23:52:31.736Z",
  "updatedAt": "2026-01-07T23:52:31.736Z"
}
```

#### 2. Obtener Todas las Notas

**GET** `/notes`

```bash
curl http://localhost:3000/notes
```

#### 3. Obtener una Nota por ID

**GET** `/notes/:id`

```bash
curl http://localhost:3000/notes/{id}
```

#### 4. Actualizar una Nota

**PUT** `/notes/:id`

```bash
curl -X PUT http://localhost:3000/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nota actualizada",
    "content": "Contenido actualizado"
  }'
```

#### 5. Eliminar una Nota

**DELETE** `/notes/:id`

```bash
curl -X DELETE http://localhost:3000/notes/{id}
```

**Respuesta:** `204 No Content`

### Validaciones

#### Crear Nota
- `title`: Requerido, string, 1-100 caracteres
- `content`: Requerido, string, mínimo 1 carácter

#### Actualizar Nota
- `title`: Opcional, string, 1-100 caracteres
- `content`: Opcional, string, mínimo 1 carácter

### Códigos de Estado HTTP

- `200 OK`: Operación exitosa (GET, PUT)
- `201 Created`: Recurso creado exitosamente (POST)
- `204 No Content`: Recurso eliminado exitosamente (DELETE)
- `400 Bad Request`: Datos de entrada inválidos
- `404 Not Found`: Recurso no encontrado

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar en modo desarrollo (con hot-reload)
npm run start:dev

# Iniciar en modo debug
npm run start:debug

# Compilar el proyecto
npm run build

# Iniciar en modo producción
npm run start:prod
```

### Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests e2e
npm run test:e2e

# Generar reporte de cobertura
npm run test:cov
```

### Linting y Formateo

```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

---

## 📦 Entidad Note

La entidad `Note` se encuentra en `src/domain/entities/note.entity.ts` y contiene:

- `id` (string): Identificador único (UUID)
- `title` (string): Título de la nota
- `content` (string): Contenido de la nota
- `createdAt` (Date): Fecha de creación
- `updatedAt` (Date): Fecha de última actualización

**Características:**
- TypeScript puro (sin decoradores)
- Sin dependencias de frameworks
- Representa el concepto del negocio

---

## 🔌 Configuración

### Base de Datos MongoDB

#### Opción 1: Sin Configuración (Recomendado para la defensa)

El proyecto **funciona sin crear archivo `.env`**, usando MongoDB local por defecto:

```bash
# NO necesitas crear .env
npm run start:dev
# Usará: mongodb://localhost:27017/ucab-tasks
```

**Requisito**: MongoDB instalado localmente ([Instrucciones de instalación](#instalar-mongodb-localmente))

#### Opción 2: MongoDB Atlas (Cloud)

Para usar MongoDB Atlas (sin instalar nada localmente):

1. **Crear archivo `.env`** en la raíz del proyecto:

```bash
# .env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/ucab-tasks?retryWrites=true&w=majority
PORT=3000
```

2. **Reemplazar** `<usuario>`, `<password>` y `<cluster>` con tus credenciales de Atlas

3. **Iniciar el servidor**:

```bash
npm run start:dev
```

#### Opción 3: MongoDB Local Personalizado

Si tienes MongoDB local en otro puerto o configuración:

```bash
# .env
MONGO_URI=mongodb://localhost:27017/mi-base-datos
PORT=3000
```

### Instalar MongoDB Localmente

#### Ubuntu/Debian
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl status mongodb
```

#### macOS (con Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows
Descargar desde: https://www.mongodb.com/try/download/community

#### Docker (Alternativa rápida)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Swagger

Swagger está configurado en `main.ts` con:
- Documentación automática de endpoints
- Ejemplos de peticiones y respuestas
- UI interactiva para probar la API
- Persistencia de autorización

### ValidationPipe

ValidationPipe global habilitado para:
- Validación automática de DTOs
- Transformación de tipos
- Eliminación de propiedades no permitidas
- Conversión implícita de tipos

---

## 🎯 Ventajas de esta Arquitectura

### 1. Testabilidad
- Fácil crear mocks de repositorios
- Tests unitarios sin base de datos
- Tests de integración con implementaciones reales

### 2. Mantenibilidad
- Código organizado y fácil de encontrar
- Cambios localizados en una capa
- Flujo de datos claro y comprensible

### 3. Escalabilidad
- Agregar nuevos casos de uso sin afectar existentes
- Cambiar implementación de persistencia fácilmente
- Agregar nuevos adaptadores (GraphQL, gRPC, etc.)

### 4. Independencia de Frameworks
- El dominio no conoce NestJS
- Fácil migrar a otro framework
- Lógica de negocio portable

### 5. Flexibilidad
- Cambiar de base de datos sin tocar lógica
- Agregar caché sin modificar casos de uso
- Múltiples implementaciones de repositorios

---

## 📚 Dependencias Instaladas

### Principales
- `@nestjs/core` - Framework NestJS
- `@nestjs/common` - Módulos comunes de NestJS
- `@nestjs/swagger` - Documentación OpenAPI/Swagger
- `swagger-ui-express` - UI de Swagger
- `class-validator` - Validación de DTOs
- `class-transformer` - Transformación de objetos

---

## 🔄 Ejemplo de Extensión: Agregar PostgreSQL

Para cambiar de persistencia en memoria a PostgreSQL:

1. **Instalar dependencias:**
```bash
npm install @nestjs/typeorm typeorm pg
```

2. **Crear nuevo repositorio:**
```typescript
// src/infrastructure/persistence/postgres-note.repository.ts
export class PostgresNoteRepository implements NoteRepository {
  // Implementación con TypeORM
}
```

3. **Cambiar en `NotesModule`:**
```typescript
{
  provide: 'NoteRepository',
  useClass: PostgresNoteRepository  // ← Solo cambiar aquí
}
```

✅ **Los casos de uso NO cambian**  
✅ **Los controladores NO cambian**  
✅ **El dominio NO cambian**  

---

## 💡 Tips y Buenas Prácticas

- Usa Swagger UI para probar los endpoints de forma interactiva
- Los cambios en el código se recargan automáticamente en modo desarrollo
- La validación de datos es automática gracias a los DTOs
- El repositorio actual es en memoria (los datos se pierden al reiniciar)
- Revisa los README.md en cada capa (`src/domain/`, `src/application/`, `src/infrastructure/`) para más detalles

---

## ❓ Solución de Problemas

### El servidor no inicia

```bash
# Verificar que las dependencias estén instaladas
npm install

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 en uso

Cambiar el puerto usando variable de entorno:

```bash
PORT=3001 npm run start:dev
```

### Errores de TypeScript

```bash
# Limpiar la compilación
npm run build

# Verificar errores de linting
npm run lint
```

---

## ✨ Próximos Pasos Sugeridos

1. **Persistencia Real**: Implementar repositorio con TypeORM o Prisma
2. **Tests**: Agregar tests unitarios e integración
3. **Autenticación**: Implementar JWT y guards
4. **Logging**: Agregar sistema de logs estructurado
5. **Manejo de Errores**: Crear filtros de excepciones personalizados
6. **Paginación**: Agregar paginación a la lista de notas
7. **Búsqueda**: Implementar búsqueda y filtros
8. **Docker**: Crear Dockerfile y docker-compose
9. **CI/CD**: Configurar pipeline de integración continua
10. **Documentación**: Agregar JSDoc a funciones complejas

---

## 🎓 Conceptos Clave

### Port (Puerto)
Interface que define el contrato (ej: `NoteRepository` interface)

### Adapter (Adaptador)
Implementación concreta del Port (ej: `InMemoryNoteRepository`)

### Inbound Adapter
Adaptador de entrada que recibe peticiones (ej: `NotesController`)

### Outbound Adapter
Adaptador de salida que accede a recursos externos (ej: repositorios)

### Use Case
Caso de uso de la aplicación que orquesta la lógica de negocio

### Entity
Objeto del dominio que representa conceptos del negocio

---

## 📄 Licencia

Este proyecto usa NestJS que es [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## 🤝 Recursos de NestJS

- Visita la [Documentación de NestJS](https://docs.nestjs.com)
- Para preguntas y soporte: [Discord de NestJS](https://discord.gg/G7Qnnhy)
- Cursos oficiales: [NestJS Courses](https://courses.nestjs.com/)
- Sigue a NestJS en [Twitter/X](https://x.com/nestframework) y [LinkedIn](https://linkedin.com/company/nestjs)

---

## 🎉 ¡Proyecto Listo!

El proyecto está completamente funcional y listo para ser usado como base para desarrollar aplicaciones más complejas siguiendo los principios de Clean Architecture.

**¡Feliz codificación!** 🚀
