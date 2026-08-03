import { Collection, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class CollectionRepository extends BaseRepository<Collection, Prisma.CollectionDelegate> {
  protected readonly model: Prisma.CollectionDelegate;

  constructor() {
    super();
    this.model = this.prisma.collection;
  }

  public async findBySlug(slug: string): Promise<Collection | null> {
    return this.prisma.collection.findFirst({
      where: { slug: slug.toLowerCase(), deletedAt: null },
    });
  }

  public async findByIdActive(id: string): Promise<Collection | null> {
    return this.prisma.collection.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async findManyActive(where?: Prisma.CollectionWhereInput): Promise<Collection[]> {
    return this.prisma.collection.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async softDelete(id: string): Promise<Collection> {
    return this.prisma.collection.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
