# carbonBox

Aplicación para cargar archivos CSV, procesar datos de actividad y consultar los resultados desde una interfaz web.


## Estado del proyecto

### Implementé

- **Backend:** Node.js, TypeScript, Fastify y Prisma 7.
- **Base de datos:** PostgreSQL. Prisma usa `@prisma/adapter-pg`.
- **Frontend:** Next.js App Router, React, React Query, Axios, Tailwind CSS y componentes shadcn/ui.
- **CQRS básico:** los comandos y consultas están separados en handlers.
- **Either:** los casos de uso usan `Either` para expresar algunos errores esperados, como CSV inválido o carga inexistente.
- **CSV:** la carga requiere las columnas `category`, `amount`, `unit` y `date`. Se validan y persisten como campos tipados; además se conserva la fila completa en JSON.
- **Interfaz:** dashboard, listado paginado, formulario de carga y detalle con estado y resultados.
- **Entorno:** Docker Compose contiene servicios para PostgreSQL y la API.

### Simplificaciones y trabajo pendiente

- La mensajería es un **mock en memoria**: no usé SQS y los mensajes no sobreviven al reinicio del backend (Falta de recursos).
- Los archivos se guardan en el **filesystem local**: no usé S3 (Falta de recursos).
- `userId` se recibe del formulario y sirve para asociar cargas; **no realicé una autenticación** (No lo ví necesario).
- No hay una suite de tests unitarios configurada (falta de tiempo).
- El procesamiento no tiene una estrategia avanzada de reintentos(falta de tiempo).
- Docker Compose está configurado pero no está testeado (falta de tiempo).

## Estructura

```text
.
├── backend/
│   ├── src/
│   │   ├── main/                     # Arranque y composición de la aplicación
│   │   ├── config/                   # Configuración
│   │   ├── document-processing/      # Dominio, aplicación, persistencia y HTTP
│   │   ├── shared/                   # Either, CQRS e interfaces compartidas
│   │   └── workers/                  # Worker del mock de procesamiento
│   ├── prisma.config.ts              # Schema, migraciones y URL para Prisma CLI
│   ├── docker-compose.yml             # PostgreSQL + API
│   └── Dockerfile
└── frontend/
    └── src/
        ├── app/                      # Dashboard, listado, carga y detalle
        ├── features/document-processing/
        ├── shared/
        └── styles/
```

El esquema Prisma está en [backend/src/document-processing/infrastructure/persistence/models/schema.prisma](./backend/src/document-processing/infrastructure/persistence/models/schema.prisma). Las migraciones PostgreSQL activas están en `backend/src/document-processing/infrastructure/persistence/models/migrations-postgresql/`.

## Requisitos

- Node.js 22 o superior para el backend.
- npm.
- PostgreSQL local, o Docker Desktop con Docker Compose.

## Configuración local con PostgreSQL instalado en Windows

1. Copia `backend/.env.example` a `backend/.env`.
2. Edita `DATABASE_URL` para que use el usuario, contraseña, puerto y base de datos de **tu servidor PostgreSQL local**.
3. Si la base indicada aún no existe, créala con PostgreSQL antes de continuar.
4. Ejecuta en una terminal:

```powershell
cd backend
npm install
npm run db:generate
npm run db:deploy
npm run dev
```

El backend queda normalmente en `http://localhost:3000`; `GET /health` comprueba si el servidor responde.

Para desarrollar cambios nuevos al schema se puede usar `npm run db:migrate`, que crea una migración. Para aplicar migraciones ya existentes usa `npm run db:deploy`.

## Configuración con Docker Compose

Desde `backend/`:

```sh
docker compose up --build
```

Compose inicia PostgreSQL y después la API; el contenedor API ejecuta `prisma migrate deploy` al arrancar. Para detener los servicios sin borrar los datos:

```sh
docker compose down
```

La base usa el volumen nombrado `postgres_data`, que persiste entre reinicios. **No uses `docker compose down -v` salvo que quieras borrar explícitamente ese volumen y sus datos.**

Hay dos configuraciones de conexión diferentes:

- Backend ejecutado directamente en Windows: `DATABASE_URL` usa `localhost` y las credenciales del PostgreSQL instalado localmente.
- API ejecutada dentro de Compose: `DATABASE_URL` usa el hostname interno `db` y las credenciales definidas para el servicio `db` en `backend/docker-compose.yml`.

No copies la URL de Docker con hostname `db` a `.env` para ejecutar el backend desde Windows: `db` solo se resuelve dentro de la red de Compose. Las credenciales del Compose son valores de desarrollo; cámbialas antes de cualquier entorno compartido o despliegue.

## Ejecutar el frontend

En otra terminal:

```sh
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3001`.

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servidor HTTP. |
| `POST` | `/api/uploads` | Crea una carga multipart con los campos `userId` y `file`. `file` debe ser CSV. |
| `GET` | `/api/uploads?page=1&pageSize=20` | Lista cargas con paginación. |
| `GET` | `/api/uploads/:uploadId` | Devuelve la carga y sus filas procesadas. |

Ejemplo de encabezados CSV requeridos:

```csv
category,amount,unit,date
energy,12.5,kWh,2026-10-12
travel,8,km,2026-10-11
```

`amount` debe ser numérico y `date` una fecha válida. El límite de carga predeterminado es 10 MiB.

Estados posibles: `PENDING`, `PROCESSING`, `COMPLETED` y `FAILED`. El detalle incluye `totalRows`, `processedRows`, `failedRows` y, cuando aplica, `errorMessage`.

`fileUrl` es actualmente una referencia local al archivo, no una URL pública. Se conserva `storagePath` para leerlo desde el almacenamiento local.

## Comprobaciones

Desde `backend/`:

```sh
npm run build
npm run db:generate
npx prisma validate
```

Desde `frontend/`:

```sh
npm run typecheck
npm run build
```

Para comprobar la configuración Compose, desde `backend/` ejecuta `docker compose config`. Esta validación comprueba el archivo YAML, no garantiza que Docker Desktop esté iniciado ni que los contenedores puedan descargar imágenes y arrancar.

## Problemas encontrados y cómo resolverlos

### `P1000` / autenticación PostgreSQL fallida

Este error indica que el servidor PostgreSQL rechazó el usuario o la contraseña. Comprueba primero, sin compartir secretos:

- Qué servidor está escuchando en el puerto `5432`.
- Si conectas al PostgreSQL instalado en Windows (`localhost`) o al servicio de Compose (`db` dentro de Docker).
- Que la URL usada por el proceso del backend corresponde a esa instancia y no hay una variable `DATABASE_URL` del sistema que esté sobrescribiendo `.env`.
- Que el backend se haya reiniciado después de editar `.env`; las variables se cargan al iniciar el proceso.

En esta sesión se observó que `localhost:5432` pertenecía a un `postgres.exe` local, no a Docker. La autenticación de la URL local se verificó y el siguiente error real era que faltaba la base `carbonbox`; se creó y se aplicaron las migraciones. También se encontraron procesos de backend anteriores ocupando el puerto `3000`, por lo que conviene detener la instancia vieja con `Ctrl+C` antes de reiniciar.

Si PostgreSQL autentica pero responde que la base de datos no existe, crea esa base con PostgreSQL y luego aplica las migraciones:

```sh
npm run db:deploy
```

No borres volúmenes ni bases de datos para resolver errores de contraseña: eso puede eliminar datos y normalmente no es necesario.

### El mensaje sobre `datasource.url` de Prisma

Prisma 7 ya no acepta `url = env("DATABASE_URL")` dentro de `schema.prisma`. En este proyecto la URL de Prisma CLI vive en `backend/prisma.config.ts`, el schema define `provider = "postgresql"` y la aplicación conecta mediante `@prisma/adapter-pg`. Mantén alineadas las versiones `prisma`, `@prisma/client` y el adaptador indicadas en `backend/package.json`.





