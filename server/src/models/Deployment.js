export class Deployment {
  constructor({ id, project_id, student_id, mentor_id, deploymentUrl, date, description, status = 'active' }) {
    this.id = id;
    this.project_id = project_id;
    this.student_id = student_id;
    this.mentor_id = mentor_id;
    this.deploymentUrl = deploymentUrl;
    this.date = date || new Date().toISOString();
    this.description = description || '';
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      project_id: this.project_id,
      student_id: this.student_id,
      mentor_id: this.mentor_id,
      deploymentUrl: this.deploymentUrl,
      date: this.date,
      description: this.description,
      status: this.status
    };
  }
}
