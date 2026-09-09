import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryImages() {
  console.log('🖼️ Updating category images with new millets assets...');

  await prisma.category.updateMany({
    where: {
      OR: [
        { slug: 'other-grains-millets' },
        { slug: 'rice-grains' },
      ],
    },
    data: {
      imageUrl: '/products-image all/millets/Thinai front image_11zon.jpg.jpeg',
    },
  });

  await prisma.category.updateMany({
    where: {
      slug: 'varieties-of-rice',
    },
    data: {
      imageUrl: '/products-image all/millets/karuppu kavuni front image.webp',
    },
  });

  console.log('✅ Category images updated!');
}

updateCategoryImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
