import { PrismaClient, ProductStatus, ProductVisibility } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMillets() {
  console.log('🌱 Starting Millets & Heritage Grains Product Seeding with Cloudinary URLs...');

  // 1. Find or create the Category
  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'other-grains-millets' },
        { slug: 'rice-grains' },
        { name: { contains: 'Millet', mode: 'insensitive' } },
      ],
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Other Grains & Millets',
        slug: 'other-grains-millets',
        description: 'Native unpolished millets, heritage grains, and super-pulses',
        status: 'ACTIVE',
        sortOrder: 1,
      },
    });
  }

  // 2. Find or create Brand
  let brand = await prisma.brand.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        name: 'Vistora Organics',
        slug: 'vistora-organics',
        description: 'Pure single-origin organic staples direct from farmers',
        status: 'ACTIVE',
      },
    });
  }

  // 3. Define the 9 Products with official Cloudinary hosted images
  const milletProducts = [
    {
      name: 'Organic Red Cholam (Red Sorghum) - 1kg',
      slug: 'organic-red-cholam-red-sorghum-1kg',
      sku: 'MLT-RCH-001',
      price: 95.0,
      compareAtPrice: 120.0,
      shortDescription: 'Unpolished antioxidant-rich Red Cholam (Red Sorghum) whole grains (1kg).',
      description:
        'High in dietary fiber, polyphenols, and plant-based protein. Ideal for diabetic-friendly meals, traditional breakfast porridge (Koozh), and gluten-free rotis.',
      color: 'Red Sorghum',
      colorHex: '#8B2500',
      stock: 60,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_front.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_3rd_image.jpg.jpg',
      ],
    },
    {
      name: 'Organic White Cholam (White Jowar) - 1kg',
      slug: 'organic-white-cholam-white-jowar-1kg',
      sku: 'MLT-WCH-002',
      price: 85.0,
      compareAtPrice: 110.0,
      shortDescription: 'Premium gluten-free White Cholam (Jowar) whole grains (1kg).',
      description:
        'Rich in essential minerals including magnesium, copper, and calcium. Ground fresh for soft, nutritious jowar bhakri, rotis, and wholesome grain bowls.',
      color: 'Pearl Ivory',
      colorHex: '#FFFFF0',
      stock: 55,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_Front.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_back_image.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/White_cholam_3rd_image.jpg.jpg',
      ],
    },
    {
      name: 'Traditional Saamai (Little Millet) - 1kg',
      slug: 'traditional-saamai-little-millet-1kg',
      sku: 'MLT-SMA-003',
      price: 105.0,
      compareAtPrice: 135.0,
      shortDescription: 'Unpolished native Little Millet (Saamai) for healthy daily meals (1kg).',
      description:
        'Packed with B-complex vitamins, iron, and dietary fiber. A delicious low-glycemic replacement for white rice in Pongal, Khichdi, and Upma.',
      color: 'Pale Golden',
      colorHex: '#EEE8AA',
      stock: 70,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017713/saamai_3rd_image_11zon.jpg.jpg',
      ],
    },
    {
      name: 'Organic Thinai (Foxtail Millet) - 1kg',
      slug: 'organic-thinai-foxtail-millet-1kg',
      sku: 'MLT-THN-004',
      price: 110.0,
      compareAtPrice: 140.0,
      shortDescription: 'Nutrient-dense unpolished Foxtail Millet (Thinai) (1kg).',
      description:
        'High in protein and dietary fiber, supports steady glucose control and heart health. Perfect for millet payasam, idli batter, and quick pulao.',
      color: 'Golden Yellow',
      colorHex: '#FFD700',
      stock: 65,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_3rd_image_11zon.jpg.jpg',
      ],
    },
    {
      name: 'Traditional Kambu (Pearl Millet / Bajra) - 1kg',
      slug: 'traditional-kambu-pearl-millet-bajra-1kg',
      sku: 'MLT-KMB-005',
      price: 80.0,
      compareAtPrice: 100.0,
      shortDescription: 'High-iron energizing native Pearl Millet (Kambu) grains (1kg).',
      description:
        'Mineral powerhouse rich in iron, zinc, and calcium. Traditional staple for fermenting cooling summer Kambu Koozh, dosas, and winter flatbreads.',
      color: 'Grey Green',
      colorHex: '#708090',
      stock: 75,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_3rd_image.webp',
      ],
    },
    {
      name: 'Heritage Karuppu Kavuni Black Rice (Emperor’s Rice) - 1kg',
      slug: 'heritage-karuppu-kavuni-black-rice-1kg',
      sku: 'RCE-KVN-006',
      price: 160.0,
      compareAtPrice: 200.0,
      shortDescription: 'Ancient Chettinad royal Black Rice packed with anthocyanin antioxidants (1kg).',
      description:
        'Known as Emperor’s Forbidden Rice. Revered for powerful antioxidant properties, deep nutty flavor, and wholesome detox sweet porridge and pongal.',
      color: 'Anthocyanin Black',
      colorHex: '#1A1110',
      stock: 45,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_front_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Blace_rice_back_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_3rd_image.jpg.jpg',
      ],
    },
    {
      name: 'Organic Native Kollu (Horse Gram) - 1kg',
      slug: 'organic-native-kollu-horse-gram-1kg',
      sku: 'PL-KLU-007',
      price: 90.0,
      compareAtPrice: 115.0,
      shortDescription: 'High-protein super-pulse Horse Gram for stamina & metabolism (1kg).',
      description:
        'Traditional super-pulse rich in iron, polyphenols, and plant protein. Renowned in Ayurvedic cooking for medicinal soup (Kollu Rasam) and weight management.',
      color: 'Rust Brown',
      colorHex: '#8B4513',
      stock: 80,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_frontside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_backside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_3rd_image.webp',
      ],
    },
    {
      name: 'Mappillai Samba Heritage Red Rice (Bridegroom Rice) - 1kg',
      slug: 'mappillai-samba-heritage-red-rice-1kg',
      sku: 'RCE-MPL-008',
      price: 140.0,
      compareAtPrice: 175.0,
      shortDescription: 'Legendary Tamil Nadu strength & stamina red heritage rice (1kg).',
      description:
        'High-zinc and iron unpolished red bran rice. Known traditionally to boost vigor, strengthen immunity, and provide sustained stamina throughout the day.',
      color: 'Ruby Red',
      colorHex: '#9B111E',
      stock: 50,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/maapillai_samba_front.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/mappilai_samba_back_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/Mapillai_samba_3rd_image.webp',
      ],
    },
    {
      name: 'Organic Varagu (Kodo Millet) - 1kg',
      slug: 'organic-varagu-kodo-millet-1kg',
      sku: 'MLT-VRG-009',
      price: 105.0,
      compareAtPrice: 135.0,
      shortDescription: 'Low-glycemic unpolished Kodo Millet (Varagu) for gut wellness (1kg).',
      description:
        'Rich in lecithin and dietary fiber. Light on digestion, stabilizes blood sugar levels, and cooks into fluffy rice dishes, upma, and bisi bele bath.',
      color: 'Buff Brown',
      colorHex: '#D2B48C',
      stock: 65,
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/varugu_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varagu_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varugu_3rd_image_11zon.jpg.jpg',
      ],
    },
  ];

  for (const item of milletProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      // Update existing
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });

      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          sku: item.sku,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          shortDescription: item.shortDescription,
          description: item.description,
          status: ProductStatus.ACTIVE,
          visibility: ProductVisibility.PUBLIC,
          featured: true,
          categoryId: category.id,
          brandId: brand.id,
          images: {
            create: item.images.map((imgUrl, idx) => ({
              imageUrl: imgUrl,
              isPrimary: idx === 0,
              sortOrder: idx + 1,
            })),
          },
          variants: {
            create: [
              {
                sku: `${item.sku}-DEFAULT`,
                color: item.color,
                colorHex: item.colorHex,
                price: item.price,
                compareAtPrice: item.compareAtPrice,
                stock: item.stock,
              },
            ],
          },
        },
      });
      console.log(`🔄 Updated product with Cloudinary images: ${item.name}`);
    } else {
      // Create new
      const created = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          shortDescription: item.shortDescription,
          description: item.description,
          status: ProductStatus.ACTIVE,
          visibility: ProductVisibility.PUBLIC,
          featured: true,
          categoryId: category.id,
          brandId: brand.id,
          images: {
            create: item.images.map((imgUrl, idx) => ({
              imageUrl: imgUrl,
              isPrimary: idx === 0,
              sortOrder: idx + 1,
            })),
          },
          variants: {
            create: [
              {
                sku: `${item.sku}-DEFAULT`,
                color: item.color,
                colorHex: item.colorHex,
                price: item.price,
                compareAtPrice: item.compareAtPrice,
                stock: item.stock,
              },
            ],
          },
        },
      });

      const variant = await prisma.productVariant.findFirst({
        where: { productId: created.id },
      });

      if (variant) {
        await prisma.inventory.create({
          data: {
            productId: created.id,
            variantId: variant.id,
            sku: variant.sku,
            availableStock: item.stock,
            minimumStock: 5,
            reorderLevel: 10,
          },
        });
      }
      console.log(`✨ Created product with Cloudinary images: ${item.name}`);
    }
  }

  console.log('✅ Successfully seeded all 9 Millets & Heritage Grain products with Cloudinary CDN URLs!');
}

seedMillets()
  .catch((e) => {
    console.error('❌ Error seeding millets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
