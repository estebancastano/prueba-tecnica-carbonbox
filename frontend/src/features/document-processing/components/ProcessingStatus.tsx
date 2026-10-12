import { Check, CircleAlert, Clock3, LoaderCircle } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { UploadStatus as UploadStatusType } from "../types/upload.types";

const statusStyles: Record<
  UploadStatusType,
  { label: string; className: string; icon: typeof Check }
> = {
  PENDING: {
    label: "En espera",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50",
    icon: Clock3
  },
  PROCESSING: {
    label: "Procesando",
    className: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50",
    icon: LoaderCircle
  },
  COMPLETED: {
    label: "Completado",
    className: "border-green-200 bg-green-50 text-green-800 hover:bg-green-50",
    icon: Check
  },
  FAILED: {
    label: "Error",
    className: "border-red-200 bg-red-50 text-red-800 hover:bg-red-50",
    icon: CircleAlert
  }
};

export function ProcessingStatus({ status }: { status: UploadStatusType }) {
  const item = statusStyles[status];
  const Icon = item.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 font-medium ${item.className}`}>
      <Icon
        size={13}
        className={status === "PROCESSING" ? "animate-spin" : undefined}
      />
      {item.label}
    </Badge>
  );
}
