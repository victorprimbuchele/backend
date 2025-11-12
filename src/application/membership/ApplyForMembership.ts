import type { ApplicationEntity, ApplicationRepository, CreateApplicationInput } from '../ports/ApplicationRepository';

export class ApplyForMembership {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(input: CreateApplicationInput): Promise<ApplicationEntity> {
    return this.applications.create(input);
  }
}


