import Link from "next/link";
import { ArrowUpRight, FileSpreadsheet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import type { Upload } from "../types/upload.types";
import { ProcessingStatus } from "./ProcessingStatus";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function UploadList({ uploads }: { uploads: Upload[] }) {
  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileSpreadsheet size={22} />
        </span>
        <h3 className="mt-4 text-sm font-semibold">
          Todavía no hay archivos
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube un CSV para empezar a procesar tus datos.
        </p>
        <Button asChild className="mt-5">
          <Link href="/uploads/new">Subir primer archivo</Link>
        </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Archivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de carga</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {uploads.map((upload) => (
              <TableRow key={upload.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-medium">
                        {upload.fileName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {upload.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <ProcessingStatus status={upload.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(upload.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link
                      href={`/uploads/${encodeURIComponent(upload.id)}`}
                      aria-label={`Ver ${upload.fileName}`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
    </Card>
  );
}
