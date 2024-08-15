# Mejoras al modelo

- Hay que poder representar las dependencias:
  - Crear links entre pieces.
  - Pintar esos links en el canvas (paths bonitos).
    Quizás no se necesario pintarlos todos.

- Siluetas?

# Workflow

El workflow debería ser este:
- Haces cambios en los ficheros (a mano / en la webapp).
- `bun run files:changes`
- `bun run db:upload` (incluye subir las imágenes!)

De vez en cuando (possibly, maybe):
- `bun run db:vaccum` que borra los hashes antiguos (los que no se usan?).

Se necesita un `--reset`, que lo sube todo de golpe, sin mirar lo que hay.

Hay dos operaciones:

1. `bun run files:changes`: actualizar todos los metadatos y mostrar los cambios que se han visto. Es un solo walk.

2. Subir a la base de datos los cambios que hay según los ficheros:
  - Subir los nuevos hashes (de pieces y files).
  - Subir el hashmap (solo las novedades).

Se puede hacer todo junto en un walk:
  - Update metadata: levels, hashes, indices.
  - Accumulate what has changed.
  - Save hashmap at the end.
