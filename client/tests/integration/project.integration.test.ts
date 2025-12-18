import { describe, it, expect, beforeEach } from 'vitest'
import { projectApi } from '@/lib/api/project'
import { loginAsAdmin, clearAuth } from './helpers'

describe('Project Integration Tests', () => {
  beforeEach(() => {
    clearAuth()
  })

  it('should perform CRUD operations on projects', async () => {
    try {
      await loginAsAdmin()

      let project;
      const newProjectData = {
        name: `Integration Test Project ${Date.now()}`,
        description: 'Created during integration test',
        startDate: new Date().toISOString(),
      }

      // 1. Try to Get Project
      try {
        project = await projectApi.getProject()
        console.log('Project already exists, using existing project.')
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // 2. Create Project if not found
          console.log('Project not found, creating new project.')
          project = await projectApi.createProject(newProjectData)
        } else {
          throw error
        }
      }

      expect(project).toBeDefined()
      expect(project.id).toBeDefined()

      // 3. Verify Singleton Constraint (if we found one, creating another should fail)
      try {
        await projectApi.createProject(newProjectData)
        // If we reach here, it means createProject succeeded unexpectedly
        throw new Error('Should have failed to create a second project')
      } catch (error: any) {
        // Expect 400 Bad Request (ValidationError)
        if (error.message === 'Should have failed to create a second project') {
            throw error;
        }
        expect(error.response).toBeDefined()
        expect(error.response.status).toBe(400)
      }

      // 4. Update Project
      const updateData = {
        description: `Updated description ${Date.now()}`
      }
      const updatedProject = await projectApi.updateProject(updateData)
      expect(updatedProject.description).toBe(updateData.description)
      expect(updatedProject.id).toBe(project.id)

    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Skipping test: Backend server is not running')
        return
      }
      throw error
    }
  })
})
