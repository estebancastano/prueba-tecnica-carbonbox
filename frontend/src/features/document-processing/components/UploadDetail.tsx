import Link from "next/link";
import { ArrowLeft, CalendarDays, FileSpreadsheet, Rows3 } from "lucide-react";
import type { UploadDetail as UploadDetailType } from "../types/upload.types";
import { ProcessingStatus } from "./ProcessingStatus";
import { ResultsTable } from "./ResultsTable";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

export function UploadDetail({ upload }: { upload: UploadDetailType }) {
  const date = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(new Date(upload.createdAt));

  return (
    <div className="space-y-7">
      <Button asChild variant="ghost" size="sm" className="-ml-3">
        <Link href="/uploads">
          <ArrowLeft size={16} /> Volver a archivos
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
              <FileSpreadsheet size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Detalle del archivo</p>
              <CardTitle className="mt-1 break-all text-xl">
                {upload.fileName}
              </CardTitle>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays size={15} /> {date}
              </p>
            </div>
          </div>
          <ProcessingStatus status={upload.status} />
        </CardHeader>

        <CardContent className="space-y-5">
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ID de carga</p>
              <p className="break-all font-mono text-xs">{upload.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="break-all text-sm font-medium">{upload.userId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Filas procesadas</p>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Rows3 size={16} className="text-muted-foreground" />
                {upload.processedRows ?? upload.activities.length}
                <span className="text-xs font-normal text-muted-foreground">
                  / {upload.totalRows ?? "—"} total · {upload.failedRows ?? "—"} fallidas
                </span>
              </p>
            </div>
          </div>

          {upload.status === "FAILED" && upload.errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{upload.errorMessage}</AlertDescription>
            </Alert>
          )}
          {(upload.status === "PENDING" || upload.status === "PROCESSING") && (
            <Alert>
              <AlertDescription>
                Esta página se actualizará automáticamente cuando termine el procesamiento.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Resultados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Registros extraídos del archivo CSV.
          </p>
        </div>
        <ResultsTable rows={upload.activities} />
      </section>
    </div>
  );
}
