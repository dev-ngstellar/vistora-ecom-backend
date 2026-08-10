import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoryImages() {
  console.log('🖼️ Updating Category Cover Images in Database...');

  const categoryImagesMap: Record<string, string> = {
    'lipsticks': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&auto=format&fit=crop&q=80',
    'lip-gloss': 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=1000&auto=format&fit=crop&q=80',
    'kajal-eyeliner': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1000&auto=format&fit=crop&q=80',
    'skincare': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1000&auto=format&fit=crop&q=80',
    'sarees-handloom': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
  };

  for (const [slug, imageUrl] of Object.entries(categoryImagesMap)) {
    const updated = await prisma.category.updateMany({
      where: { slug },
      data: { imageUrl },
    });
    console.log(`Updated category '${slug}': ${updated.count} row(s) updated.`);
  }

  console.log('✅ Category cover images updated successfully!');
  await prisma.$disconnect();
}

updateCategoryImages().catch((e) => {
  console.error('❌ Failed:', e);
  process.exit(1);
});
