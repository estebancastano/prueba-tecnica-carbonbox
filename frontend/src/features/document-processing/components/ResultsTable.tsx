import type { ActivityData } from "../types/upload.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/shared/components/ui/table";
import { Card } from "@/shared/components/ui/card";

export function ResultsTable({ rows }: { rows: ActivityData[] }) {
  if (rows.length === 0) {
    return (
      <Card className="px-6 py-12 text-center">
        <p className="text-sm font-medium">Aún no hay resultados</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Las filas procesadas aparecerán aquí cuando termine la carga.
        </p>
      </Card>
    );
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row.data)))];

  return (
    <Card className="overflow-hidden">
      <Table className="min-w-max">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>#</TableHead>
              {columns.map((column) => (
                <TableHead key={column}>
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {row.data[column] || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
      </Table>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        {rows.length} {rows.length === 1 ? "fila procesada" : "filas procesadas"}
      </div>
    </Card>
  );
}
