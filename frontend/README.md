# carbonBox frontend

Frontend en Next.js App Router con React Query, Axios y componentes locales basados en shadcn/ui para administrar cargas CSV del backend.

## Requisitos

- Node.js 20 o superior
- Backend escuchando por defecto en `http://localhost:3000`

## Desarrollo

```sh
npm install
npm run dev
```

Abre `http://localhost:3001`. Next.js reenvía `/api/*` al backend mediante una rewrite, para evitar configurar CORS en desarrollo. Si el backend escucha en otra dirección, establece `BACKEND_URL` (por ejemplo, copiando `.env.example` a `.env.local`).

## Interfaz y componentes

La interfaz usa el estilo y los patrones de **shadcn/ui**. Los componentes (`Button`, `Card`, `Badge`, `Input`, `Label`, `Alert`, `Table` y `Separator`) viven en `src/shared/components/ui/` y se mantienen dentro del proyecto para poder adaptarlos al producto. La composición de clases usa `class-variance-authority`, `clsx` y `tailwind-merge`; `Button` usa Radix Slot para soportar `asChild`. El tema define sus colores mediante variables CSS compatibles con shadcn/ui en `src/styles/globals.css`.

## Rutas

- `/`: dashboard con actividad y cargas recientes.
- `/uploads`: listado paginado de archivos.
- `/uploads/new`: formulario de carga CSV.
- `/uploads/[id]`: estado y filas de resultados; consulta el backend automáticamente mientras el archivo esté procesándose.

El formulario pide `userId` (identificador, no autenticación) y los CSV deben incluir `category`, `amount`, `unit` y `date`. Los archivos se limitan a 10 MB para coincidir con la configuración predeterminada del backend.
