import Consultants from './consultants.model';
import {
  IConsultantProfile,
  IService,
  CreateConsultantProfileInput,
  UpdateConsultantProfileInput,
  CreateServiceInput,
  UpdateServiceInput,
  PaginationQuery,
} from '../../types';

class ConsultantsService {
  async getConsultantById(id: string): Promise<IConsultantProfile> {
    const profile = await Consultants.findProfileById(id);
    if (!profile) {
      throw Object.assign(new Error('Consultant profile not found'), { statusCode: 404 });
    }
    return profile;
  }

  async getMyProfile(userId: string): Promise<IConsultantProfile | null> {
    return Consultants.findProfileByUserId(userId);
  }

  async createProfile(userId: string, input: CreateConsultantProfileInput): Promise<IConsultantProfile> {
    const existing = await Consultants.findProfileByUserId(userId);
    if (existing) {
      throw Object.assign(new Error('You already have a consultant profile'), { statusCode: 409 });
    }
    return Consultants.createProfile(userId, input);
  }

  async updateProfile(userId: string, input: UpdateConsultantProfileInput): Promise<IConsultantProfile> {
    const existing = await Consultants.findProfileByUserId(userId);
    if (!existing) {
      throw Object.assign(new Error('Consultant profile not found. Create one first.'), { statusCode: 404 });
    }
    return Consultants.updateProfile(userId, input);
  }

  async listConsultants(
    query: PaginationQuery & { availability?: string }
  ): Promise<{ consultants: IConsultantProfile[]; total: number }> {
    return Consultants.list(query);
  }

  // ---- Services ----

  async getServices(consultantId: string): Promise<IService[]> {
    return Consultants.getServices(consultantId);
  }

  async getMyServices(userId: string): Promise<IService[]> {
    const profile = await Consultants.findProfileByUserId(userId);
    if (!profile) {
      throw Object.assign(new Error('You do not have a consultant profile'), { statusCode: 404 });
    }
    return Consultants.getServices(profile.id);
  }

  async createService(userId: string, input: CreateServiceInput): Promise<IService> {
    if (!input.title) {
      throw Object.assign(new Error('Service title is required'), { statusCode: 400 });
    }
    const profile = await Consultants.findProfileByUserId(userId);
    if (!profile) {
      throw Object.assign(new Error('You must create a consultant profile first'), { statusCode: 404 });
    }
    return Consultants.createService(profile.id, input);
  }

  async updateService(userId: string, serviceId: string, input: UpdateServiceInput): Promise<IService> {
    const profile = await Consultants.findProfileByUserId(userId);
    if (!profile) {
      throw Object.assign(new Error('Consultant profile not found'), { statusCode: 404 });
    }
    return Consultants.updateService(serviceId, profile.id, input);
  }

  async deleteService(userId: string, serviceId: string): Promise<void> {
    const profile = await Consultants.findProfileByUserId(userId);
    if (!profile) {
      throw Object.assign(new Error('Consultant profile not found'), { statusCode: 404 });
    }
    await Consultants.deleteService(serviceId, profile.id);
  }
}

const consultantsService = new ConsultantsService();
export default consultantsService;
