"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Files,
} from "lucide-react";
import { useUploads } from "@/features/document-processing/api/uploadsApi";
import { UploadList } from "@/features/document-processing/components/UploadList";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import type { ReactNode } from "react";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useUploads({ page: 1, pageSize: 5 });
  const uploads = data?.items ?? [];
  const latestHundred = useUploads({ page: 1, pageSize: 100 });
  const completed = latestHundred.data?.items.filter(
    (upload) => upload.status === "COMPLETED"
  ).length ?? 0;
  const processing = latestHundred.data?.items.filter(
    (upload) => upload.status === "PROCESSING" || upload.status === "PENDING"
  ).length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta tus cargas y el estado de procesamiento.
          </p>
        </div>
        <Button asChild>
          <Link href="/uploads/new">Subir un archivo <ArrowRight size={16} /></Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total de cargas"
          value={data?.total ?? "—"}
          icon={<Files size={19} />}
          note="Archivos recibidos"
        />
        <StatCard
          label="Completadas"
          value={latestHundred.isLoading ? "—" : completed}
          icon={<CheckCircle2 size={19} />}
          note="Entre las últimas 100"
        />
        <StatCard
          label="En proceso"
          value={latestHundred.isLoading ? "—" : processing}
          icon={<Clock3 size={19} />}
          note="Pendientes o procesándose"
        />
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Cargas recientes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Tus últimos archivos CSV.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/uploads">Ver todas <ArrowUpRight size={15} /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner label="Cargando tus archivos..." />
            ) : isError ? (
              <ErrorState onRetry={() => void refetch()} />
            ) : (
              <UploadList uploads={uploads} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  note
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  note: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>No se pudieron cargar los archivos</AlertTitle>
      <AlertDescription>
        <p>Comprueba que el backend esté ejecutándose y vuelve a intentarlo.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3"
        >
          Reintentar <ArrowRight size={14} />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
