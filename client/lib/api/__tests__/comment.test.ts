import { describe, it, expect } from 'vitest'
import { commentApi } from '../comment'

describe('Comment API', () => {
  it('should list comments', async () => {
    const comments = await commentApi.listComments()
    expect(comments).toHaveLength(1)
    expect(comments[0].content).toBe('Great work!')
  })

  it('should get comment by id', async () => {
    const comment = await commentApi.getCommentById('comment-1')
    expect(comment.id).toBe('comment-1')
    expect(comment.content).toBe('Great work!')
  })

  it('should create comment', async () => {
    const newComment = await commentApi.createComment({
      content: 'New Comment',
      taskId: 'task-1',
    })
    expect(newComment.id).toBe('comment-new')
    expect(newComment.content).toBe('New Comment')
  })

  it('should update comment', async () => {
    const updatedComment = await commentApi.updateComment('comment-1', {
      content: 'Updated Comment',
    })
    expect(updatedComment.id).toBe('comment-1')
  })

  it('should delete comment', async () => {
    await expect(commentApi.deleteComment('comment-1')).resolves.not.toThrow()
  })
})
