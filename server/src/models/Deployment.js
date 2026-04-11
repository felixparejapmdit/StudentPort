export class Deployment {
  constructor({ id, projectName, studentName, mentorName, deploymentUrl, date, description, status = 'active' }) {
    this.id = id;
    this.projectName = projectName;
    this.studentName = studentName;
    this.mentorName = mentorName;
    this.deploymentUrl = deploymentUrl;
    this.date = date || new Date().toISOString();
    this.description = description || '';
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      projectName: this.projectName,
      studentName: this.studentName,
      mentorName: this.mentorName,
      deploymentUrl: this.deploymentUrl,
      date: this.date,
      description: this.description,
      status: this.status
    };
  }
}
