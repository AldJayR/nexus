import type { MeetingLog } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const meetingLogApi = {
  uploadMeetingLog: async (
    sprintId: string,
    title: string,
    file: File
  ): Promise<MeetingLog> => {
    const client = await createApiClient();
    const formData = new FormData();
    formData.append("sprintId", sprintId);
    formData.append("title", title);
    formData.append("file", file);

    const response = await client.post(
      API_ENDPOINTS.MEETING_LOGS.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getMeetingLogsBySprint: async (sprintId: string): Promise<MeetingLog[]> => {
    const client = await createApiClient();
    const response = await client.get(
      API_ENDPOINTS.MEETING_LOGS.BY_SPRINT(sprintId)
    );
    return response.data;
  },

  deleteMeetingLog: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.MEETING_LOGS.DELETE(id));
  },
};
