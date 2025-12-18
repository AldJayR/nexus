import type { ActivityLog } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const activityLogApi = {
  listActivityLogs: async (): Promise<ActivityLog[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.ACTIVITY_LOGS.LIST);
    return response.data;
  },

  getActivityLogsByEntity: async (
    entityType: string,
    entityId: string
  ): Promise<ActivityLog[]> => {
    const client = await createApiClient();
    const response = await client.get(
      API_ENDPOINTS.ACTIVITY_LOGS.BY_ENTITY(entityType, entityId)
    );
    return response.data;
  },
};
