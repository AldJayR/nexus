import { describe, it, expect } from 'vitest'
import { evidenceApi } from '../evidence'

describe('Evidence API', () => {
  it('should get evidence by deliverable', async () => {
    const evidenceList = await evidenceApi.getEvidenceByDeliverable('del-1')
    expect(evidenceList).toHaveLength(1)
    expect(evidenceList[0].deliverableId).toBe('del-1')
  })

  it('should delete evidence', async () => {
    await expect(evidenceApi.deleteEvidence('evidence-1')).resolves.not.toThrow()
  })

  it('should restore evidence', async () => {
    const restored = await evidenceApi.restoreEvidence('evidence-1')
    expect(restored.deletedAt).toBeNull()
  })
})
