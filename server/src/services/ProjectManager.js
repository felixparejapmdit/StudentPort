import { v4 as uuidv4 } from 'uuid';
import { Deployment } from '../models/Deployment.js';

export class ProjectManager {
  constructor(repository) {
    this.repository = repository;
  }

  async createDeployment(data) {
    const now = new Date().toISOString();
    const deployment = new Deployment({
      id: uuidv4(),
      ...data,
      date: data.date || now,
      updatedAt: now,
      reviews: []
    });
    return await this.repository.save(deployment.toJSON());
  }

  async getAllDeployments() {
    const data = await this.repository.getAll();
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getDeploymentById(id) {
    const data = await this.repository.getAll();
    return data.find(d => d.id === id);
  }

  async updateDeployment(id, data) {
    const existing = await this.getDeploymentById(id);
    if (!existing) return null;
    
    // If URL changes, mark as updated for new version notification
    const isNewVersion = data.deploymentUrl && data.deploymentUrl !== existing.deploymentUrl;
    
    const updated = { 
      ...existing, 
      ...data, 
      id,
      updatedAt: isNewVersion ? new Date().toISOString() : existing.updatedAt || existing.date
    };
    return await this.repository.save(updated);
  }

  async addReview(id, review) {
    const project = await this.getDeploymentById(id);
    if (!project) return null;
    
    const reviews = project.reviews || [];
    const newReview = {
      id: uuidv4(),
      teacherName: review.teacherName || 'Teacher',
      comment: review.comment,
      imageUrl: review.imageUrl || null,
      status: 'pending', // pending, in_progress, resolved
      replies: [], // Threaded conversation
      date: new Date().toISOString()
    };
    
    reviews.push(newReview);
    return await this.updateDeployment(id, { reviews });
  }

  async updateReview(projectId, reviewId, updatedComment) {
    const project = await this.getDeploymentById(projectId);
    if (!project) return null;
    
    const reviews = project.reviews.map(r => 
      r.id === reviewId ? { ...r, comment: updatedComment, editedAt: new Date().toISOString() } : r
    );
    
    return await this.updateDeployment(projectId, { reviews });
  }

  async updateReviewStatus(projectId, reviewId, status) {
    const project = await this.getDeploymentById(projectId);
    if (!project) return null;
    
    const reviews = project.reviews.map(r => 
      r.id === reviewId ? { ...r, status } : r
    );
    
    return await this.updateDeployment(projectId, { reviews });
  }

  async addReply(projectId, reviewId, reply) {
    const project = await this.getDeploymentById(projectId);
    if (!project) return null;
    
    const reviews = project.reviews.map(r => {
      if (r.id === reviewId) {
        const replies = r.replies || [];
        replies.push({
          id: uuidv4(),
          name: reply.name,
          text: reply.text,
          date: new Date().toISOString()
        });
        return { ...r, replies };
      }
      return r;
    });
    
    return await this.updateDeployment(projectId, { reviews });
  }

  async deleteReview(projectId, reviewId) {
    const project = await this.getDeploymentById(projectId);
    if (!project) return null;
    
    const reviews = project.reviews.filter(r => r.id !== reviewId);
    return await this.updateDeployment(projectId, { reviews });
  }

  async deleteDeployment(id) {
    await this.repository.delete(id);
  }
}
