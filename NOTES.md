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

# Entornos

- Máquina local:

  - `bun dev`, next.js (NODE_ENV=development)
    - Edición del contenido (BACKEND=files), i a veces:
      - Prueba con base de datos (BACKEND=db)
  - `bun sync` NODE_ENV no afecta?
    - Bases de datos: local "development", "preview", "production".
      (Usar `bun -r ...`?)
  - `bunx drizzle-kit ...` NODE_ENV no afecta?
    - Bases de datos: local "development", "preview", "production".
      (Usar `bun -r ...`)
  - `bun run build`, next.js (NODE_ENV=production)
    - Con ficheros (BACKEND=files)
    - En la base de datos (BACKEND=db)
      - Base de datos local ("development")
      - Base de datos remota ("preview"). Por tanto

- Vercel:
  - `bun run build` NODE_ENV=production
    - Con variables de entorno para "preview" (rama !== "main")
    - Con variables de entorno para "production" (rama === "main")
