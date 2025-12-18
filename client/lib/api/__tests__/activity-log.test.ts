import { describe, it, expect } from 'vitest'
import { activityLogApi } from '../activity-log'

describe('Activity Log API', () => {
  it('should list activity logs', async () => {
    const logs = await activityLogApi.listActivityLogs()
    expect(logs).toHaveLength(1)
    expect(logs[0].action).toBe('CREATED_TASK')
    expect(logs[0].entityType).toBe('Task')
  })
})
