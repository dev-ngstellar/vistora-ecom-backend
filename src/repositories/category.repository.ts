import { Category, CategoryStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
  parent?: Category | null;
};

export class CategoryRepository extends BaseRepository<Category, Prisma.CategoryDelegate> {
  protected readonly model: Prisma.CategoryDelegate;

  constructor() {
    super();
    this.model = this.prisma.category;
  }

  public async findBySlug(slug: string): Promise<CategoryWithChildren | null> {
    return this.prisma.category.findFirst({
      where: { slug: slug.toLowerCase(), deletedAt: null },
      include: {
        parent: true,
        children: { where: { deletedAt: null } },
      },
    }) as Promise<CategoryWithChildren | null>;
  }

  public async findByIdActive(id: string): Promise<CategoryWithChildren | null> {
    return this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: { where: { deletedAt: null } },
      },
    }) as Promise<CategoryWithChildren | null>;
  }

  public async findManyActive(where?: Prisma.CategoryWhereInput): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  public async getCategoryTree(): Promise<CategoryWithChildren[]> {
    return this.prisma.category.findMany({
      where: { parentId: null, deletedAt: null, status: CategoryStatus.ACTIVE },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { deletedAt: null, status: CategoryStatus.ACTIVE },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { deletedAt: null, status: CategoryStatus.ACTIVE },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    }) as Promise<CategoryWithChildren[]>;
  }

  public async softDelete(id: string): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
