import { Banner, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface BannerQueryFilters {
  search?: string;
  position?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class BannerRepository extends BaseRepository<Banner, Prisma.BannerDelegate> {
  protected readonly model: Prisma.BannerDelegate;

  constructor() {
    super();
    this.model = this.prisma.banner;
  }

  public async findBanners(filters: BannerQueryFilters) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BannerWhereInput = {};

    if (filters.position) {
      where.position = filters.position;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { buttonText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.banner.count({ where }),
    ]);

    return {
      banners,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async findActivePublicBanners(position?: string) {
    const now = new Date();
    const where: Prisma.BannerWhereInput = {
      isActive: true,
      ...(position ? { position } : {}),
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };

    return this.prisma.banner.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  public async toggleActiveStatus(id: string, isActive: boolean) {
    return this.prisma.banner.update({
      where: { id },
      data: { isActive },
    });
  }
}
