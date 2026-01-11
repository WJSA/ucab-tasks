# Capa de Infraestructura

Esta capa contiene los adaptadores y detalles de implementación.

## Características

- **Adaptadores**: Implementa las interfaces definidas en el dominio
- **Detalles técnicos**: HTTP, base de datos, validaciones, etc.
- **Dependiente de frameworks**: Usa NestJS, class-validator, etc.

## Estructura

```
infrastructure/
├── controllers/       # Controladores HTTP
├── dtos/             # Data Transfer Objects (validación)
├── persistence/      # Implementación de repositorios
└── *.module.ts       # Módulos de NestJS
```

## Componentes

### Controladores
- Manejan las peticiones HTTP
- Validan datos de entrada usando DTOs
- Delegan la lógica a los casos de uso
- Formatean las respuestas

### DTOs
- Validan datos de entrada
- Usan decoradores de class-validator
- Documentan con Swagger

### Repositorios
- Implementan las interfaces del dominio
- Manejan la persistencia de datos
- Pueden usar ORMs, bases de datos, APIs externas, etc.

## Reglas

1. Los controladores no deben contener lógica de negocio
2. Los DTOs solo para validación y documentación
3. Los repositorios implementan las interfaces del dominio
4. Esta capa puede cambiar sin afectar el dominio

