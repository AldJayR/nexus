import type { MeetingLog } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const meetingLogApi = {
  uploadMeetingLog: async (input: {
    title: string;
    date: string;
    file: File;
    sprintId?: string;
    phaseId?: string;
  }): Promise<MeetingLog> => {
    const client = await createApiClient();
    const formData = new FormData();
    if (input.sprintId) {
      formData.append("sprintId", input.sprintId);
    }
    if (input.phaseId) {
      formData.append("phaseId", input.phaseId);
    }
    formData.append("title", input.title);
    formData.append("date", input.date);
    formData.append("file", input.file);

    const response = await client.post(
      API_ENDPOINTS.MEETING_LOGS.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120_000, // 120 seconds for file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
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

  getMeetingLogsByPhase: async (phaseId: string): Promise<MeetingLog[]> => {
    const client = await createApiClient();
    const response = await client.get(
      API_ENDPOINTS.MEETING_LOGS.BY_PHASE(phaseId)
    );
    return response.data;
  },

  deleteMeetingLog: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.MEETING_LOGS.DELETE(id));
  },
};
