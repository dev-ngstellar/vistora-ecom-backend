import { BannerQueryFilters, BannerRepository } from '../../repositories/banner.repository';
import { ApiError } from '../../utils/api-error.util';

export class BannerService {
  private bannerRepository: BannerRepository;

  constructor() {
    this.bannerRepository = new BannerRepository();
  }

  public async getBanners(filters: BannerQueryFilters) {
    return this.bannerRepository.findBanners(filters);
  }

  public async getActivePublicBanners(position?: string) {
    return this.bannerRepository.findActivePublicBanners(position);
  }

  public async getBannerById(id: string) {
    const banner = await this.bannerRepository.findById(id);
    if (!banner) {
      throw ApiError.notFound('Banner not found');
    }
    return banner;
  }

  public async createBanner(data: any) {
    return this.bannerRepository.create({
      title: data.title,
      subtitle: data.subtitle || null,
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl || null,
      position: data.position || 'HERO_SLIDER',
      buttonText: data.buttonText || null,
      buttonLink: data.buttonLink || null,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });
  }

  public async updateBanner(id: string, data: any) {
    const existing = await this.bannerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Banner not found');
    }

    return this.bannerRepository.update(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  }

  public async toggleActiveStatus(id: string, isActive: boolean) {
    const existing = await this.bannerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Banner not found');
    }
    return this.bannerRepository.toggleActiveStatus(id, isActive);
  }

  public async deleteBanner(id: string) {
    const existing = await this.bannerRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Banner not found');
    }
    return this.bannerRepository.delete(id);
  }
}
