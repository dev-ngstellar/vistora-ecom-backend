/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/prisma.config';

export interface FindManyOptions<
  WhereInput = unknown,
  OrderByInput = unknown,
  IncludeInput = unknown,
> {
  skip?: number;
  take?: number;
  where?: WhereInput;
  orderBy?: OrderByInput;
  include?: IncludeInput;
}

export interface IBaseRepository<T> {
  findMany(options?: FindManyOptions): Promise<T[]>;
  findById(id: string, include?: unknown): Promise<T | null>;
  findOne(where: unknown, include?: unknown): Promise<T | null>;
  create(data: unknown, include?: unknown): Promise<T>;
  update(id: string, data: unknown, include?: unknown): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: unknown): Promise<number>;
  exists(where: unknown): Promise<boolean>;
}

export abstract class BaseRepository<
  T,
  ModelDelegate extends {
    findMany(args?: any): Promise<any>;
    findUnique(args: any): Promise<any>;
    findFirst(args?: any): Promise<any>;
    create(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
    count(args?: any): Promise<any>;
  },
> implements IBaseRepository<T> {
  protected readonly prisma: PrismaClient;
  protected abstract readonly model: ModelDelegate;

  constructor(prismaClient: PrismaClient = defaultPrisma) {
    this.prisma = prismaClient;
  }

  public async findMany(options?: FindManyOptions): Promise<T[]> {
    return this.model.findMany(options);
  }

  public async findById(id: string, include?: unknown): Promise<T | null> {
    const args: Record<string, unknown> = { where: { id } };
    if (include) {
      args['include'] = include;
    }
    return this.model.findUnique(args);
  }

  public async findOne(where: unknown, include?: unknown): Promise<T | null> {
    const args: Record<string, unknown> = { where };
    if (include) {
      args['include'] = include;
    }
    return this.model.findFirst(args);
  }

  public async create(data: unknown, include?: unknown): Promise<T> {
    const args: Record<string, unknown> = { data };
    if (include) {
      args['include'] = include;
    }
    return this.model.create(args);
  }

  public async update(id: string, data: unknown, include?: unknown): Promise<T> {
    const args: Record<string, unknown> = {
      where: { id },
      data,
    };
    if (include) {
      args['include'] = include;
    }
    return this.model.update(args);
  }

  public async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  public async count(where?: unknown): Promise<number> {
    return this.model.count(where ? { where } : undefined);
  }

  public async exists(where: unknown): Promise<boolean> {
    const record = await this.model.findFirst({ where });
    return record !== null;
  }
}
