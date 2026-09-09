import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEEP_SLUGS = [
  'organic-red-cholam-red-sorghum-1kg',
  'organic-white-cholam-white-jowar-1kg',
  'traditional-saamai-little-millet-1kg',
  'organic-thinai-foxtail-millet-1kg',
  'traditional-kambu-pearl-millet-bajra-1kg',
  'heritage-karuppu-kavuni-black-rice-1kg',
  'organic-native-kollu-horse-gram-1kg',
  'mappillai-samba-heritage-red-rice-1kg',
  'organic-varagu-kodo-millet-1kg',
];

async function deleteOtherProducts() {
  console.log('🧹 Finding products to remove (keeping only the 9 millet products)...');

  // Find all products that should be deleted
  const productsToDelete = await prisma.product.findMany({
    where: {
      slug: {
        notIn: KEEP_SLUGS,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  const deleteIds = productsToDelete.map((p) => p.id);

  console.log(`Found ${deleteIds.length} other products to remove:`);
  productsToDelete.forEach((p) => console.log(` - [${p.slug}] ${p.name}`));

  if (deleteIds.length === 0) {
    console.log('No other products found to delete.');
    return;
  }

  // 1. Delete dependent items
  await prisma.orderItem.deleteMany({ where: { productId: { in: deleteIds } } });
  await prisma.cartItem.deleteMany({ where: { productId: { in: deleteIds } } });
  await prisma.wishlistItem.deleteMany({ where: { productId: { in: deleteIds } } });
  await prisma.inventory.deleteMany({ where: { productId: { in: deleteIds } } });

  const variants = await prisma.productVariant.findMany({
    where: { productId: { in: deleteIds } },
    select: { id: true },
  });
  const variantIds = variants.map((v) => v.id);
  if (variantIds.length > 0) {
    await prisma.productVariantImage.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } });
  }

  await prisma.productImage.deleteMany({ where: { productId: { in: deleteIds } } });
  await prisma.productAttributeValue.deleteMany({ where: { attribute: { productId: { in: deleteIds } } } });
  await prisma.productAttribute.deleteMany({ where: { productId: { in: deleteIds } } });
  await prisma.review.deleteMany({ where: { productId: { in: deleteIds } } });

  // 2. Delete the products
  const res = await prisma.product.deleteMany({
    where: { id: { in: deleteIds } },
  });

  console.log(`✅ Successfully deleted ${res.count} other products!`);

  // Verify remaining products
  const remaining = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log(`\nRemaining ${remaining.length} products in DB:`);
  remaining.forEach((p) => console.log(` ✔ [${p.slug}] ${p.name}`));
}

deleteOtherProducts()
  .catch((e) => {
    console.error('❌ Error deleting other products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
