import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PriceConfig {
  nameMatch: string;
  slugMatch?: string;
  price500g: number;
  price1kg: number;
  tamilName: string;
}

const pricingData: PriceConfig[] = [
  {
    tamilName: 'வரகு',
    nameMatch: 'Organic Varagu',
    slugMatch: 'organic-varagu',
    price500g: 131.0,
    price1kg: 185.0,
  },
  {
    tamilName: 'திணை',
    nameMatch: 'Thinai',
    slugMatch: 'thinai',
    price500g: 131.0,
    price1kg: 183.0,
  },
  {
    tamilName: 'சாமை',
    nameMatch: 'Saamai',
    slugMatch: 'saamai',
    price500g: 190.0,
    price1kg: 292.0,
  },
  {
    tamilName: 'குதிரை வாலி',
    nameMatch: 'Kuthiraivali',
    slugMatch: 'kuthiraivali',
    price500g: 177.0,
    price1kg: 266.0,
  },
  {
    tamilName: 'கருங்குறுவை',
    nameMatch: 'Karunkuruvai',
    slugMatch: 'karunkuruvai',
    price500g: 147.0,
    price1kg: 206.0,
  },
  {
    tamilName: 'காட்டுயானம்',
    nameMatch: 'Kaattuyanam',
    slugMatch: 'kaattuyanam',
    price500g: 149.0,
    price1kg: 209.0,
  },
  {
    tamilName: 'பனி வரகு',
    nameMatch: 'Pani Varagu',
    slugMatch: 'pani-varagu',
    price500g: 152.0,
    price1kg: 218.0,
  },
  {
    tamilName: 'பூணம் அரிசி',
    nameMatch: 'Poongar',
    slugMatch: 'poongar',
    price500g: 142.0,
    price1kg: 194.0,
  },
  {
    tamilName: 'குள்ளக்கார் அரிசி',
    nameMatch: 'Kullakar',
    slugMatch: 'kullakar',
    price500g: 142.0,
    price1kg: 194.0,
  },
  {
    tamilName: 'தூயமல்லி அரிசி',
    nameMatch: 'Thooyamalli',
    slugMatch: 'thooyamalli',
    price500g: 143.0,
    price1kg: 199.0,
  },
  {
    tamilName: 'கருப்புகவுனி',
    nameMatch: 'Karuppu Kavuni',
    slugMatch: 'karuppu-kavuni',
    price500g: 159.0,
    price1kg: 230.0,
  },
  {
    tamilName: 'மாப்பிள்ளை சம்பா',
    nameMatch: 'Mappillai Samba',
    slugMatch: 'mappillai-samba',
    price500g: 129.0,
    price1kg: 169.0,
  },
  {
    tamilName: 'வெள்ளை சோளம்',
    nameMatch: 'White Cholam',
    slugMatch: 'white-cholam',
    price500g: 114.0,
    price1kg: 137.0,
  },
  {
    tamilName: 'சிவப்பு சோளம்',
    nameMatch: 'Red Cholam',
    slugMatch: 'red-cholam',
    price500g: 119.0,
    price1kg: 146.0,
  },
  {
    tamilName: 'கொள்ளு',
    nameMatch: 'Kollu',
    slugMatch: 'kollu',
    price500g: 134.0,
    price1kg: 177.0,
  },
  {
    tamilName: 'கைக்குத்தல் அரிசி',
    nameMatch: 'Hand-Pounded',
    slugMatch: 'hand-pounded',
    price500g: 140.0,
    price1kg: 189.0,
  },
  {
    tamilName: 'ராகி',
    nameMatch: 'Native Ragi (Finger Millet)',
    slugMatch: 'ragi-finger-millet',
    price500g: 120.0,
    price1kg: 149.0,
  },
  {
    tamilName: 'கம்பு',
    nameMatch: 'Kambu',
    slugMatch: 'kambu',
    price500g: 114.0,
    price1kg: 136.0,
  },
  {
    tamilName: 'ராகி மாவு',
    nameMatch: 'Ragi Flour',
    slugMatch: 'ragi-flour',
    price500g: 130.0,
    price1kg: 169.0,
  },
  {
    tamilName: 'உளுந்தங்கஞ்சி மாவு',
    nameMatch: 'Ulundhang',
    slugMatch: 'ulundhang',
    price500g: 247.0,
    price1kg: 390.0,
  },
];

async function updatePrices() {
  console.log('🔄 Starting product price synchronization from price sheet...\n');
  let updatedCount = 0;

  for (const item of pricingData) {
    // Find products matching either name or slug
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: item.nameMatch, mode: Prisma.QueryMode.insensitive } },
          ...(item.slugMatch
            ? [{ slug: { contains: item.slugMatch, mode: Prisma.QueryMode.insensitive } }]
            : []),
        ],
      },
      include: {
        variants: true,
      },
    });

    if (products.length === 0) {
      console.warn(`⚠️ No product found for ${item.tamilName} (${item.nameMatch})`);
      continue;
    }

    for (const product of products) {
      // Base product price is 500g price (lowest available option)
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: item.price500g,
        },
      });

      console.log(`📦 Updating [${item.tamilName}] ${product.name}:`);

      // Update variants if available
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const sizeLower = (variant.size || '').toLowerCase();
          const skuLower = (variant.sku || '').toLowerCase();
          const currentPrice = Number(variant.price);
          const variantWeight = variant.weight !== null ? Number(variant.weight) : null;

          let newPrice = currentPrice;

          if (sizeLower.includes('500') || skuLower.includes('500g') || sizeLower.includes('1/2')) {
            newPrice = item.price500g;
          } else if (sizeLower.includes('1kg') || skuLower.includes('1kg') || sizeLower.includes('1 kg')) {
            newPrice = item.price1kg;
          } else if (variantWeight === 0.5) {
            newPrice = item.price500g;
          } else if (variantWeight === 1.0) {
            newPrice = item.price1kg;
          }

          if (newPrice !== currentPrice) {
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: {
                price: newPrice,
              },
            });
            console.log(`   └─ Variant ${variant.size || variant.sku}: ₹${currentPrice} -> ₹${newPrice}`);
          } else {
            console.log(`   └─ Variant ${variant.size || variant.sku}: kept ₹${currentPrice}`);
          }
        }
      } else {
        console.log(`   └─ Base product updated to ₹${item.price500g}`);
      }

      updatedCount++;
    }
  }

  console.log(`\n✅ Completed price update for ${updatedCount} product entries!`);
}

updatePrices()
  .catch((e) => {
    console.error('❌ Error updating prices:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
