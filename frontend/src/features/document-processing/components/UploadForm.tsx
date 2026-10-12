"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, FileUp, LoaderCircle, UploadCloud } from "lucide-react";
import { useCreateUpload } from "../api/uploadsApi";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState("");
  const [validationError, setValidationError] = useState("");
  const mutation = useCreateUpload();

  function selectFile(candidate?: File) {
    setValidationError("");
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setValidationError("Selecciona un archivo con extensión .csv.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null);
      setValidationError("El archivo supera el límite de 10 MB.");
      return;
    }
    setFile(candidate);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId.trim()) {
      setValidationError("Ingresa el ID del usuario.");
      return;
    }
    if (!file) {
      setValidationError("Selecciona un archivo CSV para continuar.");
      return;
    }
    try {
      const upload = await mutation.mutateAsync({ file, userId: userId.trim() });
      router.push(`/uploads/${encodeURIComponent(upload.id)}`);
    } catch {
      setValidationError(
        "No se pudo subir el archivo. Comprueba que el backend esté disponible e inténtalo de nuevo."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="userId">ID del usuario</Label>
        <Input
          id="userId"
          type="text"
          required
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Ej. usuario-123"
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Se asociará esta carga y sus resultados con este usuario.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleChange}
        className="sr-only"
        aria-label="Seleccionar archivo CSV"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="group flex h-auto min-h-56 w-full flex-col items-center justify-center whitespace-normal border-dashed bg-muted/20 px-6 py-10 text-center hover:bg-accent/40"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-md border bg-background text-muted-foreground">
          {file ? <FileUp size={25} /> : <UploadCloud size={25} />}
        </span>
        {file ? (
          <>
            <span className="mt-4 max-w-full truncate text-sm font-medium text-foreground">
              {file.name}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB · Listo para subir
            </span>
          </>
        ) : (
          <>
            <span className="mt-4 text-sm font-medium text-foreground">
              Haz clic para elegir un archivo CSV
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              Formato .csv · Tamaño máximo 10 MB
            </span>
          </>
        )}
      </Button>

      {(validationError || mutation.isError) && (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription>
            {validationError || "Ocurrió un error al subir el archivo."}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setFile(null);
            setValidationError("");
            setUserId("");
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          disabled={!file || mutation.isPending}
        >
          {mutation.isPending ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <UploadCloud size={17} />
          )}
          {mutation.isPending ? "Subiendo..." : "Subir archivo"}
        </Button>
      </div>
    </form>
  );
}
