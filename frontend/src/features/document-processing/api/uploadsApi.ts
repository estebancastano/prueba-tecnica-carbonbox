"use client";

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type {
  ListUploadsParams,
  Upload,
  UploadDetail,
  UploadListResponse
} from "../types/upload.types";

const uploadsKey = ["uploads"] as const;

export async function listUploads(
  params: ListUploadsParams = {}
): Promise<UploadListResponse> {
  const { data } = await apiClient.get<UploadListResponse>("/uploads", {
    params: { page: 1, pageSize: 20, ...params }
  });
  return data;
}

export async function getUpload(id: string): Promise<UploadDetail> {
  const { data } = await apiClient.get<UploadDetail>(
    `/uploads/${encodeURIComponent(id)}`
  );
  return data;
}

export async function createUpload(input: {
  file: File;
  userId: string;
}): Promise<Upload> {
  const formData = new FormData();
  formData.append("userId", input.userId);
  formData.append("file", input.file);
  const { data } = await apiClient.post<Upload>("/uploads", formData);
  return data;
}

export function useUploads(params: ListUploadsParams = {}) {
  return useQuery({
    queryKey: [...uploadsKey, params],
    queryFn: () => listUploads(params),
    refetchInterval: (query) =>
      query.state.data?.items.some(
        (upload) => upload.status === "PENDING" || upload.status === "PROCESSING"
      )
        ? 2_000
        : false
  });
}

export function useUpload(id: string) {
  return useQuery({
    queryKey: [...uploadsKey, id],
    queryFn: () => getUpload(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 2_000 : false;
    }
  });
}

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUpload,
    onSuccess: async (upload) => {
      await queryClient.invalidateQueries({ queryKey: uploadsKey });
      queryClient.setQueryData([...uploadsKey, upload.id], {
        ...upload,
        activities: []
      } satisfies UploadDetail);
    }
  });
}

export const uploadQueryKeys = uploadsKey;
