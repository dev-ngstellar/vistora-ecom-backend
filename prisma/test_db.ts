import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDB() {
  console.log('==================================================');
  console.log('      VISTORA CATALOG OVERHAUL VERIFICATION      ');
  console.log('==================================================');
  
  const catCount = await prisma.category.count();
  const categories = await prisma.category.findMany({ select: { name: true, slug: true } });
  console.log(`\n1. Categories Count: ${catCount}`);
  console.table(categories);

  const brandCount = await prisma.brand.count();
  const brands = await prisma.brand.findMany({ select: { name: true, slug: true } });
  console.log(`\n2. Brand / Supplier Count: ${brandCount}`);
  console.table(brands);

  const prodCount = await prisma.product.count();
  console.log(`\n3. Total Active Products: ${prodCount}`);

  const varCount = await prisma.productVariant.count();
  console.log(`\n4. Total Product Variants: ${varCount}`);

  const invCount = await prisma.inventory.count();
  console.log(`\n5. Total Inventory Stock Records: ${invCount}`);

  const samples = await prisma.product.findMany({
    take: 8,
    select: {
      name: true,
      sku: true,
      price: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      images: { select: { imageUrl: true } },
      variants: { select: { stock: true } },
    },
  });

  console.log('\n6. Sample Product Entries:');
  console.table(samples.map(p => ({
    name: p.name,
    sku: p.sku,
    category: p.category.name,
    brand_supplier: p.brand?.name || 'N/A',
    price: `₹${p.price}`,
    stock: p.variants[0]?.stock || 0,
    image: p.images[0]?.imageUrl || 'N/A'
  })));

  await prisma.$disconnect();
}

testDB();
