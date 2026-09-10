import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryImages() {
  console.log('🖼️ Updating category images with Cloudinary assets...');

  await prisma.category.updateMany({
    where: {
      OR: [
        { slug: 'other-grains-millets' },
        { slug: 'rice-grains' },
      ],
    },
    data: {
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_front_image_11zon.jpg.jpg',
    },
  });

  await prisma.category.updateMany({
    where: {
      slug: 'varieties-of-rice',
    },
    data: {
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_front_image.jpg.jpg',
    },
  });

  console.log('✅ Category images updated to Cloudinary URLs!');
}

updateCategoryImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
