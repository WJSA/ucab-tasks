# Capa de Dominio

Esta capa contiene la lógica de negocio pura y las entidades del dominio.

## Características

- **Sin dependencias externas**: No depende de frameworks ni librerías externas
- **TypeScript puro**: Solo tipos y clases de TypeScript
- **Entidades**: Representan los conceptos del negocio
- **Interfaces de Repositorios**: Definen los contratos para la persistencia

## Estructura

```
domain/
├── entities/           # Entidades del dominio
└── repositories/       # Interfaces de repositorios (Ports)
```

## Reglas

1. No usar decoradores de frameworks
2. No importar código de las capas de aplicación o infraestructura
3. Mantener las entidades simples y enfocadas en el negocio
4. Las interfaces de repositorios definen QUÉ se necesita, no CÓMO se implementa

