import { CMSPageStatus } from '@prisma/client';
import { CMSPageQueryFilters, CMSRepository } from '../../repositories/cms.repository';
import { ApiError } from '../../utils/api-error.util';

export class CMSService {
  private cmsRepository: CMSRepository;

  constructor() {
    this.cmsRepository = new CMSRepository();
  }

  public async getPages(filters: CMSPageQueryFilters) {
    return this.cmsRepository.findPages(filters);
  }

  public async getPageById(id: string) {
    const page = await this.cmsRepository.findById(id);
    if (!page) {
      throw ApiError.notFound('CMS Page not found');
    }
    return page;
  }

  public async getPublicPageBySlug(slug: string) {
    const page = await this.cmsRepository.findBySlug(slug);
    if (!page || page.status !== CMSPageStatus.PUBLISHED) {
      throw ApiError.notFound(`Page '/${slug}' not found or not published`);
    }
    return page;
  }

  public async createPage(data: any) {
    const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
    const existing = await this.cmsRepository.findBySlug(slug);
    if (existing) {
      throw ApiError.conflict(`Page with slug '${slug}' already exists`);
    }

    return this.cmsRepository.create({
      title: data.title,
      slug,
      content: data.content,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || null,
      status: data.status || CMSPageStatus.DRAFT,
      publishedAt: data.status === CMSPageStatus.PUBLISHED ? new Date() : null,
    });
  }

  public async updatePage(id: string, data: any) {
    const existing = await this.cmsRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('CMS Page not found');
    }

    let slug = existing.slug;
    if (data.slug && data.slug.toLowerCase() !== existing.slug) {
      slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const conflict = await this.cmsRepository.findBySlug(slug);
      if (conflict && conflict.id !== id) {
        throw ApiError.conflict(`Page with slug '${slug}' already exists`);
      }
    }

    return this.cmsRepository.update(id, {
      ...data,
      slug,
      publishedAt: data.status === CMSPageStatus.PUBLISHED && !existing.publishedAt ? new Date() : existing.publishedAt,
    });
  }

  public async updateStatus(id: string, status: CMSPageStatus) {
    const existing = await this.cmsRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('CMS Page not found');
    }
    return this.cmsRepository.updateStatus(id, status);
  }

  public async deletePage(id: string) {
    const existing = await this.cmsRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('CMS Page not found');
    }
    return this.cmsRepository.delete(id);
  }
}
