# CarbonBox backend

Backend TypeScript con Fastify, Prisma 7/PostgreSQL mediante `@prisma/adapter-pg`, almacenamiento local de archivos y procesamiento CSV asíncrono mediante una cola mock en memoria.

## Requisitos

- Node.js 22 o superior
- Docker con Docker Compose
- npm
- Prisma CLI y cliente alineados en la versión 7 (se instalan con `npm install`)

## Instalación y ejecución

Desde `backend/`, copia `.env.example` a `.env` y arranca PostgreSQL local:

```sh
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Para iniciar la API y PostgreSQL juntos en contenedores:

```sh
docker compose up --build
```

El servidor escucha por defecto en `http://localhost:3000`.

La configuración se puede modificar mediante `HOST`, `PORT`, `DATABASE_URL`, `UPLOAD_DIRECTORY` y `MAX_FILE_SIZE_BYTES`. La URL local predeterminada es `postgresql://carbonbox:carbonbox@localhost:5432/carbonbox?schema=public`; cambia las credenciales en `.env` y `docker-compose.yml` para un despliegue real. El valor predeterminado limita los archivos a 10 MiB.

## API

- `POST /api/uploads`: recibe `userId` y un archivo CSV en el multipart (`userId` y `file`); responde `202` con el estado inicial del upload.
- `GET /api/uploads?page=1&pageSize=20`: lista uploads en orden descendente por fecha.
- `GET /api/uploads/:uploadId`: consulta el estado, metadatos y filas procesadas del upload.
- `GET /health`: comprobación de disponibilidad.

El worker requiere las columnas `category`, `amount`, `unit` y `date` en cada CSV. `amount` debe ser numérico y `date` debe ser una fecha válida. Guarda esos campos en columnas tipadas y conserva además la fila completa en `data` como JSON. `totalRows`, `processedRows` y `failedRows` registran el resultado del procesamiento. Los estados posibles son `PENDING`, `PROCESSING`, `COMPLETED` y `FAILED`; los errores quedan disponibles como `errorMessage`.

`fileUrl` conserva la referencia relativa usada por el almacenamiento local; no es una URL HTTP pública. Se mantiene `storagePath` por compatibilidad con el servicio de filesystem. Las columnas tipadas de `ActivityData` son nullable para que la migración no invente valores en filas históricas; todos los registros creados por cargas nuevas se validan y rellenan. Los uploads anteriores quedan asociados al usuario de migración `legacy`, ya que antes no se recibía un identificador de usuario.

Las migraciones SQLite históricas permanecen en `src/document-processing/infrastructure/persistence/models/migrations` como referencia. Las migraciones activas de PostgreSQL están en `migrations-postgresql`; el cambio de proveedor arranca una base PostgreSQL nueva y no copia datos de una base SQLite existente.

`userId` es un identificador declarado por el cliente, no una identidad autenticada. Cuando se incorpore autenticación, se debe obtener del usuario autenticado en el servidor y dejar de confiar en este campo del formulario.

Los casos de uso expresan errores esperados con `Either<Error, Resultado>`: por ejemplo, nombre de archivo inválido, upload inexistente o CSV mal formado. La capa HTTP convierte esos errores a códigos HTTP; los fallos de infraestructura (base de datos, disco o publicación) siguen propagándose como excepciones para que se registren y no se confundan con errores de validación.

La cola mock en memoria sirve para desarrollo local y no conserva mensajes al reiniciar el proceso. En despliegues con varios procesos, reemplázala por SQS u otro broker duradero. Los archivos se guardan en el filesystem local; PostgreSQL usa el volumen Docker `postgres_data`.
