import { describe, it, expect } from 'vitest'
import { phaseApi } from '../phase'
import { PhaseType } from '@/lib/types'

describe('Phase API', () => {
  it('should list phases', async () => {
    const phases = await phaseApi.listPhases()
    expect(phases).toHaveLength(1)
    expect(phases[0].name).toBe('Phase 1')
  })

  it('should get phase by id', async () => {
    const phase = await phaseApi.getPhaseById('phase-1')
    expect(phase.id).toBe('phase-1')
    expect(phase.name).toBe('Phase 1')
    expect(phase.type).toBe('WATERFALL')
  })

  it('should create phase', async () => {
    const newPhase = await phaseApi.createPhase({
      name: 'New Phase',
      type: PhaseType.WATERFALL,
    })
    expect(newPhase.id).toBe('phase-new')
    expect(newPhase.name).toBe('New Phase')
  })

  it('should update phase', async () => {
    const updatedPhase = await phaseApi.updatePhase('phase-1', { name: 'Updated Phase' })
    expect(updatedPhase.name).toBe('Updated Phase')
  })

  it('should delete phase', async () => {
    await expect(phaseApi.deletePhase('phase-1')).resolves.not.toThrow()
  })
})
