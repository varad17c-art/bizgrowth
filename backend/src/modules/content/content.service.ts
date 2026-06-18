import Content from './content.model';
import {
  IContent,
  CreateContentInput,
  UpdateContentInput,
  PaginationQuery,
} from '../../types';

class ContentService {
  async getContentById(id: string): Promise<IContent> {
    const item = await Content.findById(id);
    if (!item) {
      throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    }
    Content.incrementViews(id).catch(() => {});
    return item;
  }

  async getMyContent(authorId: string): Promise<IContent[]> {
    return Content.findByAuthorId(authorId);
  }

  async createContent(authorId: string, input: CreateContentInput): Promise<IContent> {
    if (!input.title || !input.type) {
      throw Object.assign(new Error('Title and type are required'), { statusCode: 400 });
    }
    return Content.create(authorId, input);
  }

  async updateContent(
    contentId: string,
    userId: string,
    input: UpdateContentInput,
    isAdmin: boolean
  ): Promise<IContent> {
    const existing = await Content.findById(contentId);
    if (!existing) {
      throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.authorId !== userId) {
      throw Object.assign(new Error('You do not have permission to update this content'), { statusCode: 403 });
    }
    return Content.update(contentId, input);
  }

  async deleteContent(contentId: string, userId: string, isAdmin: boolean): Promise<void> {
    const existing = await Content.findById(contentId);
    if (!existing) {
      throw Object.assign(new Error('Content not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.authorId !== userId) {
      throw Object.assign(new Error('You do not have permission to delete this content'), { statusCode: 403 });
    }
    await Content.delete(contentId);
  }

  async listContent(
    query: PaginationQuery & { type?: string; status?: string }
  ): Promise<{ content: IContent[]; total: number }> {
    return Content.list(query);
  }

  async publishContent(contentId: string, userId: string, isAdmin: boolean): Promise<IContent> {
    return this.updateContent(contentId, userId, { status: 'published' }, isAdmin);
  }
}

const contentService = new ContentService();
export default contentService;
