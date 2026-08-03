import { Brand, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class BrandRepository extends BaseRepository<Brand, Prisma.BrandDelegate> {
  protected readonly model: Prisma.BrandDelegate;

  constructor() {
    super();
    this.model = this.prisma.brand;
  }

  public async findBySlug(slug: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({
      where: { slug: slug.toLowerCase(), deletedAt: null },
    });
  }

  public async findByIdActive(id: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findManyActive(where?: Prisma.BrandWhereInput): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  public async softDelete(id: string): Promise<Brand> {
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
