import { CMSPage, CMSPageStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CMSPageQueryFilters {
  search?: string;
  status?: CMSPageStatus;
  page?: number;
  limit?: number;
}

export class CMSRepository extends BaseRepository<CMSPage, Prisma.CMSPageDelegate> {
  protected readonly model: Prisma.CMSPageDelegate;

  constructor() {
    super();
    this.model = this.prisma.cMSPage;
  }

  public async findPages(filters: CMSPageQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CMSPageWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { metaTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      this.prisma.cMSPage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.cMSPage.count({ where }),
    ]);

    return {
      pages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findBySlug(slug: string) {
    return this.prisma.cMSPage.findUnique({
      where: { slug: slug.toLowerCase() },
    });
  }

  public async updateStatus(id: string, status: CMSPageStatus) {
    return this.prisma.cMSPage.update({
      where: { id },
      data: {
        status,
        ...(status === CMSPageStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
      },
    });
  }
}
