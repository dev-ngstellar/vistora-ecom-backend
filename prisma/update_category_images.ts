import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryImages() {
  console.log('🖼️ Updating Category Cover Images with Clean Direct Imagery...');

  const categoryImagesMap: Record<string, string> = {
    // Parent Categories
    'rice-grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1000&auto=format&fit=crop&q=80',
    'spices-masala-powders': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1000&auto=format&fit=crop&q=80',
    'health-mix-nutrition': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80',

    // Subcategories
    'varieties-of-rice': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
    'other-grains-millets': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    'red-chilli-powder': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    'turmeric-powder': 'https://images.unsplash.com/photo-1615485290176-65476a2eb245?w=800&auto=format&fit=crop&q=80',
    'coriander-powder': 'https://images.unsplash.com/photo-1509358217951-4ff270043167?w=800&auto=format&fit=crop&q=80',
    'other-masala-powders': 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80',
    'health-mix': 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?w=800&auto=format&fit=crop&q=80',
    'millet-health-mix': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
    'traditional-nutrition-mixes': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    'kids-health-mix': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
  };

  for (const [slug, imageUrl] of Object.entries(categoryImagesMap)) {
    const updated = await prisma.category.updateMany({
      where: { slug },
      data: { imageUrl },
    });
    console.log(`Updated category '${slug}': ${updated.count} row(s) updated.`);
  }

  console.log('✅ Clean category images updated successfully!');
  await prisma.$disconnect();
}

updateCategoryImages().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
