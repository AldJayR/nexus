import { describe, it, expect } from 'vitest'
import { meetingLogApi } from '../meeting-log'

describe('Meeting Log API', () => {
  it('should get meeting logs by sprint', async () => {
    const logs = await meetingLogApi.getMeetingLogsBySprint('sprint-1')
    expect(logs).toHaveLength(1)
    expect(logs[0].sprintId).toBe('sprint-1')
    expect(logs[0].title).toBe('Sprint Planning')
  })

  it('should get meeting logs by phase', async () => {
    const logs = await meetingLogApi.getMeetingLogsByPhase('phase-1')
    expect(logs).toHaveLength(1)
    expect(logs[0].phaseId).toBe('phase-1')
    expect(logs[0].title).toBe('Phase Kickoff')
  })

  it('should delete meeting log', async () => {
    await expect(meetingLogApi.deleteMeetingLog('log-1')).resolves.not.toThrow()
  })
})
