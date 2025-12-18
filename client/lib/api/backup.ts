import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const backupApi = {
  exportData: async (): Promise<Blob> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.BACKUP.EXPORT, {
      responseType: "blob",
    });
    return response.data;
  },

  getFilesBackupUrl: async (): Promise<{ url: string }> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.BACKUP.FILES);
    return response.data;
  },
};
