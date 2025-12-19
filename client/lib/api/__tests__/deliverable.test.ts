import { describe, it, expect } from 'vitest'
import { deliverableApi } from '../deliverable'
import { DeliverableStatus } from '@/lib/types'

describe('Deliverable API', () => {
  it('should list deliverables', async () => {
    const deliverables = await deliverableApi.listDeliverables()
    expect(deliverables).toHaveLength(1)
    expect(deliverables[0].title).toBe('Deliverable 1')
  })

  it('should get deliverable by id', async () => {
    const deliverable = await deliverableApi.getDeliverableById('del-1')
    expect(deliverable.id).toBe('del-1')
    expect(deliverable.status).toBe('NOT_STARTED')
  })

  it('should create deliverable', async () => {
    const newDeliverable = await deliverableApi.createDeliverable({
      phaseId: 'phase-1',
      title: 'New Deliverable',
    })
    expect(newDeliverable.id).toBe('del-new')
    expect(newDeliverable.title).toBe('New Deliverable')
  })

  it('should update deliverable', async () => {
    const updatedDeliverable = await deliverableApi.updateDeliverable('del-1', {
      status: DeliverableStatus.IN_PROGRESS,
    })
    expect(updatedDeliverable.id).toBe('del-1')
  })

  it('should delete deliverable', async () => {
    await expect(deliverableApi.deleteDeliverable('del-1')).resolves.not.toThrow()
  })

  it('should restore deliverable', async () => {
    const restored = await deliverableApi.restoreDeliverable('del-1')
    expect(restored.deletedAt).toBeNull()
  })
})
