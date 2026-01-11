# Capa de Aplicación

Esta capa contiene los casos de uso de la aplicación.

## Características

- **Orquestación**: Coordina las operaciones del dominio
- **Independiente de frameworks**: No depende de detalles de implementación
- **Un caso de uso por operación**: Cada archivo representa una operación específica

## Estructura

```
application/
└── use-cases/         # Casos de uso (servicios de aplicación)
```

## Reglas

1. Cada caso de uso debe tener una única responsabilidad
2. Depende solo de la capa de dominio
3. Recibe dependencias a través del constructor (DI)
4. No debe conocer detalles de HTTP, base de datos, etc.

## Patrón

```typescript
@Injectable()
export class MiCasoDeUso {
  constructor(
    @Inject('MiRepositorio')
    private readonly miRepositorio: MiRepositorio,
  ) {}

  async execute(params: any): Promise<any> {
    // Lógica del caso de uso
  }
}
```

