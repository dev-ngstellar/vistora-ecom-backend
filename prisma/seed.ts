import { AccountStatus, AddressType, AuthProvider, BrandStatus, CategoryStatus, CouponStatus, CouponType, OrderStatus, PaymentMethod, PaymentStatus, ProductStatus, ProductVisibility, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting Clean Vistora Rice & Grains Database Seeding...');

  // 1. Seed System Roles
  console.log('📦 Seeding Roles & Permission Matrices...');
  const defaultSuperAdminMatrix = {
    dashboard: ['read', 'write', 'delete', 'export'],
    catalog: ['read', 'write', 'delete', 'export'],
    sales: ['read', 'write', 'delete', 'export'],
    customers: ['read', 'write', 'delete', 'export'],
    content: ['read', 'write', 'delete', 'export'],
    administration: ['read', 'write', 'delete', 'export'],
    settings: ['read', 'write', 'delete', 'export'],
  };

  const defaultAdminMatrix = {
    dashboard: ['read', 'write', 'export'],
    catalog: ['read', 'write', 'delete', 'export'],
    sales: ['read', 'write', 'export'],
    customers: ['read', 'write', 'export'],
    content: ['read', 'write', 'delete', 'export'],
    administration: ['read', 'write'],
    settings: ['read', 'write'],
  };

  const defaultManagerMatrix = {
    dashboard: ['read'],
    catalog: ['read', 'write'],
    sales: ['read', 'write'],
    customers: ['read'],
    content: ['read', 'write'],
    administration: ['read'],
    settings: ['read'],
  };

  const roles = [
    { name: UserRole.SUPER_ADMIN, description: 'Super Administrator with full platform access', permissions: defaultSuperAdminMatrix },
    { name: UserRole.ADMIN, description: 'Administrator for daily store and catalogue operations', permissions: defaultAdminMatrix },
    { name: UserRole.MANAGER, description: 'Store Manager for order and inventory handling', permissions: defaultManagerMatrix },
    { name: UserRole.CUSTOMER, description: 'Registered Customer account', permissions: {} },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description, permissions: roleData.permissions },
      create: roleData,
    });
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: UserRole.SUPER_ADMIN } });
  const customerRole = await prisma.role.findUniqueOrThrow({ where: { name: UserRole.CUSTOMER } });

  // 2. Seed Initial Super Admin User
  console.log('👤 Seeding Super Admin Account...');
  const adminEmail = 'admin@vistoracommerce.com';
  const hashedPassword = await bcrypt.hash('Admin@Vistora2026', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      roleId: superAdminRole.id,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      fullName: 'System Administrator',
      provider: AuthProvider.LOCAL,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleId: superAdminRole.id,
    },
  });

  console.log(`✅ Super Admin created: ${adminUser.email}`);

  // 3. Seed Sample Customers
  console.log('👥 Seeding Customer Accounts...');
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const sampleCustomers = [
    { firstName: 'Eleanor', lastName: 'Vance', email: 'eleanor.vance@example.com', phone: '+91 98765 43210', status: AccountStatus.ACTIVE },
    { firstName: 'Julian', lastName: 'Sterling', email: 'julian.sterling@example.com', phone: '+91 98765 43211', status: AccountStatus.ACTIVE },
    { firstName: 'Sophia', lastName: 'Chen', email: 'sophia.chen@example.com', phone: '+91 98765 43212', status: AccountStatus.ACTIVE },
  ];

  const createdCustomers = [];
  for (const cust of sampleCustomers) {
    const c = await prisma.user.upsert({
      where: { email: cust.email },
      update: { status: cust.status },
      create: {
        email: cust.email,
        password: customerPassword,
        firstName: cust.firstName,
        lastName: cust.lastName,
        fullName: `${cust.firstName} ${cust.lastName}`,
        phone: cust.phone,
        provider: AuthProvider.LOCAL,
        status: cust.status,
        emailVerified: true,
        roleId: customerRole.id,
      },
    });
    createdCustomers.push(c);

    await prisma.address.createMany({
      data: [
        {
          userId: c.id,
          type: AddressType.HOME,
          fullName: `${cust.firstName} ${cust.lastName}`,
          phone: cust.phone,
          addressLine1: '42 Silk Avenue, Promenade Towers',
          addressLine2: 'Suite 14B',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          isDefault: true,
        },
      ],
      skipDuplicates: true,
    });
  }

  // 4. Safely Clean Old Catalog Items
  console.log('🧹 Purging old demo catalog data...');
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productVariantImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.banner.deleteMany({});

  // 5. Seed Banners for Hero Slider
  console.log('🖼️ Seeding Hero Slider Banners...');
  const newBanners = [
    {
      title: 'Fresh Rice & Organic Grains',
      subtitle: 'Premium Royal Basmati, Hand-Pounded Lean Rice, Karuppu Kavuni, and unpolished grains delivered fresh.',
      imageUrl: '/products-image all/hand_pounded_lean_rice_banner_showcase.webp',
      mobileImageUrl: '/products-image all/hand_pounded_lean_rice_front_image.webp',
      position: 'HERO_SLIDER',
      buttonText: 'Shop Rice & Grains',
      buttonLink: '/shop?category=rice-grains',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Native Millets & Supergrains',
      subtitle: 'Unpolished Organic Ragi, Kambu Kurunai, Foxtail (Thinai), Little Millet (Saamai), and native superfoods.',
      imageUrl: '/products-image all/ragi_banner_showcase.webp',
      mobileImageUrl: '/products-image all/ragi_front_image.webp',
      position: 'HERO_SLIDER',
      buttonText: 'Explore Millets',
      buttonLink: '/shop?category=other-grains-millets',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Traditional Health & Wellness Staples',
      subtitle: 'Ancient grains rich in calcium, iron, and fiber for natural everyday vitality.',
      imageUrl: '/products-image all/kambu_kurunai_banner_showcase.webp',
      mobileImageUrl: '/products-image all/kambu_kurunai_front_image.webp',
      position: 'HERO_SLIDER',
      buttonText: 'Explore Products',
      buttonLink: '/shop',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const b of newBanners) {
    await prisma.banner.create({ data: b });
  }

  // 6. Seed Parent Category: Rice & Grains and Subcategories
  console.log('📁 Seeding Rice & Grains Category and Subcategories...');

  const catRiceGrains = await prisma.category.create({
    data: {
      name: 'Rice & Grains',
      slug: 'rice-grains',
      description: 'Premium quality raw, boiled, basmati rice varieties, unrefined heritage grains, and native superfoods',
      imageUrl: '/products-image all/hand_pounded_lean_rice_banner_showcase.webp',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subVarietiesOfRice = await prisma.category.create({
    data: {
      name: 'Varieties of Rice',
      slug: 'varieties-of-rice',
      parentId: catRiceGrains.id,
      description: 'Hand-Pounded Lean Rice, Royal Basmati, Organic Sona Masoori, Karuppu Kavuni, and Mappillai Samba',
      imageUrl: '/products-image all/hand_pounded_lean_rice_front_image.webp',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subOtherGrains = await prisma.category.create({
    data: {
      name: 'Other Grains & Millets',
      slug: 'other-grains-millets',
      parentId: catRiceGrains.id,
      description: 'Organic Ragi, Kambu Kurunai, Thinai, Saamai, Varagu, Red Cholam, White Jowar, and Native Kollu',
      imageUrl: '/products-image all/ragi_banner_showcase.webp',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  // 7. Seed Brands
  console.log('🏷️ Seeding Brands...');
  const brandVistoraOrganics = await prisma.brand.create({
    data: {
      name: 'Vistora Organics',
      slug: 'vistora-organics',
      description: '100% Certified Organic Grains, Heritage Rice & Pure Traditional Formulations',
      website: 'https://vistoracommerce.com',
      address: 'Vistora Organic Mills, 12, Food Park Estate, Namakkal, Tamil Nadu - 638183',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  const brandGramiyaa = await prisma.brand.create({
    data: {
      name: 'Gramiyaa Naturals',
      slug: 'gramiyaa-naturals',
      description: 'Traditional wood-pressed and stone-milled staples sourced directly from heritage farmers',
      website: 'https://gramiyaa.com',
      address: 'Gramiyaa Farms, Trichy Highway, Tamil Nadu - 620001',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  // 8. Seed Realistic Food Products (Only Rice & Grains + Millets)
  console.log('🌾 Seeding Pure Rice, Grain & Millet Products...');

  const productDataList = [
    // ---------------- Subcategory 1: Varieties of Rice (6 Products) ----------------
    {
      name: 'Traditional Hand-Pounded Lean Rice (500g)',
      slug: 'traditional-hand-pounded-lean-rice-500g',
      sku: 'RICE-HPL-001',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 110.00,
      compareAtPrice: 140.00,
      shortDescription: 'Minimally processed nutrient-rich Hand Pounded Lean Rice (500g).',
      description: 'Hand pounded lean rice is a traditional, minimally processed rice variety that retains its natural bran, nutrients and authentic flavour. Rich in fiber, vitamins and minerals compared to polished rice, making it a healthier choice for you and your family.',
      images: [
        '/products-image all/hand_pounded_lean_rice_front_image.webp',
        '/products-image all/hand_pounded_lean_rice_back_image.webp',
        '/products-image all/hand_pounded_lean_rice_banner_showcase.webp',
      ],
      color: 'Lean Brown',
      colorHex: '#C4A482',
      stock: 50,
    },
    {
      name: 'Premium Royal Basmati Rice (1kg)',
      slug: 'premium-royal-basmati-rice-1kg',
      sku: 'RICE-BAS-002',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 180.00,
      compareAtPrice: 220.00,
      shortDescription: 'Extra-long grain aromatic Royal Basmati Rice (1kg pack).',
      description: 'Aged to perfection for exquisite aroma, fluffy texture, and non-sticky cooking. Ideal for biryanis, pulao, and festive meals.',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&auto=format&fit=crop&q=80',
      ],
      color: 'Pearl White',
      colorHex: '#FFFFFF',
      stock: 60,
    },
    {
      name: 'Organic Sona Masoori Raw Rice (5kg)',
      slug: 'organic-sona-masoori-raw-rice-5kg',
      sku: 'RICE-SON-003',
      categoryId: subVarietiesOfRice.id,
      brandId: brandGramiyaa.id,
      price: 399.00,
      compareAtPrice: 480.00,
      shortDescription: 'Lightweight aromatic medium-grain Sona Masoori raw rice (5kg).',
      description: 'Cultivated organically without chemical fertilizers. Lightweight, easy to digest, perfect for daily meals, sambar rice, and variety rice dishes.',
      images: [
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&auto=format&fit=crop&q=80',
      ],
      color: 'Off-White',
      colorHex: '#FAF9F6',
      stock: 45,
    },
    {
      name: 'South Indian Steam Ponni Rice (5kg)',
      slug: 'south-indian-steam-ponni-rice-5kg',
      sku: 'RICE-PON-004',
      categoryId: subVarietiesOfRice.id,
      brandId: brandGramiyaa.id,
      price: 360.00,
      compareAtPrice: 420.00,
      shortDescription: 'Hygienically steamed Ponni rice for soft fluffy meals (5kg).',
      description: 'A staple across South Indian households, processed under strict quality controls for soft texture, pleasant aroma, and great everyday taste.',
      images: [
        'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      ],
      color: 'Classic White',
      colorHex: '#F5F5F5',
      stock: 40,
    },
    {
      name: 'Heritage Karuppu Kavuni Black Rice (Emperor’s Rice) - 1kg',
      slug: 'heritage-karuppu-kavuni-black-rice-1kg',
      sku: 'RCE-KVN-005',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 160.00,
      compareAtPrice: 200.00,
      shortDescription: 'Ancient Chettinad royal Black Rice packed with anthocyanin antioxidants (1kg).',
      description: 'Known as Emperor’s Forbidden Rice. Revered for powerful antioxidant properties, deep nutty flavor, and wholesome detox sweet porridge and pongal.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_front_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Blace_rice_back_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_3rd_image.jpg.jpg',
      ],
      color: 'Anthocyanin Black',
      colorHex: '#1A1110',
      stock: 45,
    },
    {
      name: 'Mappillai Samba Heritage Red Rice (Bridegroom Rice) - 1kg',
      slug: 'mappillai-samba-heritage-red-rice-1kg',
      sku: 'RCE-MPL-006',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 140.00,
      compareAtPrice: 175.00,
      shortDescription: 'Legendary Tamil Nadu strength & stamina red heritage rice (1kg).',
      description: 'High-zinc and iron unpolished red bran rice. Known traditionally to boost vigor, strengthen immunity, and provide sustained stamina throughout the day.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/maapillai_samba_front.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/mappilai_samba_back_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/Mapillai_samba_3rd_image.webp',
      ],
      color: 'Ruby Red',
      colorHex: '#9B111E',
      stock: 50,
    },

    // ---------------- Subcategory 2: Other Grains & Millets (9 Products) ----------------
    {
      name: 'Organic Native Ragi (Finger Millet) - 500g',
      slug: 'organic-native-ragi-finger-millet-500g',
      sku: 'MLT-RAG-007',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 75.00,
      compareAtPrice: 95.00,
      shortDescription: 'High-calcium unpolished organic Finger Millet / Ragi (500g).',
      description: 'Ragi (Finger Millet) is a traditional, nutrient-rich whole grain known for its high calcium, fiber and plant-based protein. It is naturally grown and a perfect choice for a healthy and balanced diet for all age groups.',
      images: [
        '/products-image all/ragi_front_image.webp',
        '/products-image all/ragi_back_image.webp',
        '/products-image all/ragi_banner_showcase.webp',
      ],
      color: 'Deep Maroon Brown',
      colorHex: '#5C1D24',
      stock: 80,
    },
    {
      name: 'Traditional Kambu Kurunai (Pearl Millet Grits) - 500g',
      slug: 'traditional-kambu-kurunai-pearl-millet-grits-500g',
      sku: 'MLT-KKR-008',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 70.00,
      compareAtPrice: 90.00,
      shortDescription: 'Unpolished broken Pearl Millet Grits / Kambu Kurunai (500g).',
      description: 'Pearl Millet Grits (Kambu) is a traditional, nutrient-rich grain known for its high fiber content, plant-based protein, essential minerals and slow-releasing energy. Ideal for porridge, upma, and adai.',
      images: [
        '/products-image all/kambu_kurunai_front_image.webp',
        '/products-image all/kambu_back_image.webp',
        '/products-image all/kambu_kurunai_banner_showcase.webp',
      ],
      color: 'Millet Speckled',
      colorHex: '#8F9779',
      stock: 75,
    },
    {
      name: 'Traditional Kambu (Pearl Millet / Bajra) - 1kg',
      slug: 'traditional-kambu-pearl-millet-bajra-1kg',
      sku: 'MLT-KMB-009',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 80.00,
      compareAtPrice: 100.00,
      shortDescription: 'High-iron energizing native Pearl Millet (Kambu) grains (1kg).',
      description: 'Mineral powerhouse rich in iron, zinc, and calcium. Traditional staple for fermenting cooling summer Kambu Koozh, dosas, and nutritious flatbreads.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_3rd_image.webp',
      ],
      color: 'Grey Green',
      colorHex: '#708090',
      stock: 75,
    },
    {
      name: 'Organic Red Cholam (Red Sorghum) - 1kg',
      slug: 'organic-red-cholam-red-sorghum-1kg',
      sku: 'MLT-RCH-010',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 95.00,
      compareAtPrice: 120.00,
      shortDescription: 'Unpolished antioxidant-rich Red Cholam (Red Sorghum) whole grains (1kg).',
      description: 'High in dietary fiber, polyphenols, and plant-based protein. Ideal for diabetic-friendly meals, traditional breakfast porridge (Koozh), and gluten-free rotis.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_front.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_3rd_image.jpg.jpg',
      ],
      color: 'Red Sorghum',
      colorHex: '#8B2500',
      stock: 60,
    },
    {
      name: 'Organic White Cholam (White Jowar) - 1kg',
      slug: 'organic-white-cholam-white-jowar-1kg',
      sku: 'MLT-WCH-011',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 85.00,
      compareAtPrice: 110.00,
      shortDescription: 'Premium gluten-free White Cholam (Jowar) whole grains (1kg).',
      description: 'Rich in essential minerals including magnesium, copper, and calcium. Ground fresh for soft, nutritious jowar bhakri, rotis, and wholesome grain bowls.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_Front.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_back_image.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/White_cholam_3rd_image.jpg.jpg',
      ],
      color: 'Pearl Ivory',
      colorHex: '#FFFFF0',
      stock: 55,
    },
    {
      name: 'Traditional Saamai (Little Millet) - 1kg',
      slug: 'traditional-saamai-little-millet-1kg',
      sku: 'MLT-SMA-012',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 105.00,
      compareAtPrice: 135.00,
      shortDescription: 'Unpolished native Little Millet (Saamai) for healthy daily meals (1kg).',
      description: 'Packed with B-complex vitamins, iron, and dietary fiber. A delicious low-glycemic replacement for white rice in Pongal, Khichdi, and Upma.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017713/saamai_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Pale Golden',
      colorHex: '#EEE8AA',
      stock: 70,
    },
    {
      name: 'Organic Thinai (Foxtail Millet) - 1kg',
      slug: 'organic-thinai-foxtail-millet-1kg',
      sku: 'MLT-THN-013',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 110.00,
      compareAtPrice: 140.00,
      shortDescription: 'Nutrient-dense unpolished Foxtail Millet (Thinai) (1kg).',
      description: 'High in protein and dietary fiber, supports steady glucose control and heart health. Perfect for millet payasam, idli batter, and quick pulao.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Golden Yellow',
      colorHex: '#FFD700',
      stock: 65,
    },
    {
      name: 'Organic Native Kollu (Horse Gram) - 1kg',
      slug: 'organic-native-kollu-horse-gram-1kg',
      sku: 'PL-KLU-014',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 90.00,
      compareAtPrice: 115.00,
      shortDescription: 'High-protein super-pulse Horse Gram for stamina & metabolism (1kg).',
      description: 'Traditional super-pulse rich in iron, polyphenols, and plant protein. Renowned in Ayurvedic cooking for medicinal soup (Kollu Rasam) and weight management.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_frontside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_backside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_3rd_image.webp',
      ],
      color: 'Rust Brown',
      colorHex: '#8B4513',
      stock: 80,
    },
    {
      name: 'Organic Varagu (Kodo Millet) - 1kg',
      slug: 'organic-varagu-kodo-millet-1kg',
      sku: 'MLT-VRG-015',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 105.00,
      compareAtPrice: 135.00,
      shortDescription: 'Low-glycemic unpolished Kodo Millet (Varagu) for gut wellness (1kg).',
      description: 'Rich in lecithin and dietary fiber. Light on digestion, stabilizes blood sugar levels, and cooks into fluffy rice dishes, upma, and bisi bele bath.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/varugu_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varagu_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varugu_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Buff Brown',
      colorHex: '#D2B48C',
      stock: 65,
    },
  ];

  for (const item of productDataList) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        featured: true,
        status: ProductStatus.ACTIVE,
        visibility: ProductVisibility.PUBLIC,
        categoryId: item.categoryId,
        brandId: item.brandId,
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

    // Create inventory record linked to default variant
    const variant = await prisma.productVariant.findFirst({ where: { productId: product.id } });
    if (variant) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          sku: variant.sku,
          availableStock: item.stock,
          minimumStock: 5,
          reorderLevel: 10,
        },
      });
    }
  }

  console.log(`✅ Successfully seeded ${productDataList.length} pure Rice & Grain products!`);

  // 9. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  await prisma.coupon.upsert({
    where: { code: 'VISTORA10' },
    update: {},
    create: {
      code: 'VISTORA10',
      title: 'Welcome 10% Discount',
      description: 'Get 10% off on your first order of organic rice & native millets',
      type: CouponType.PERCENTAGE,
      value: 10,
      minimumOrderAmount: 299,
      maximumDiscount: 500,
      usageLimit: 500,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: CouponStatus.ACTIVE,
    },
  });

  // 10. Seed Demo Order
  console.log('🛒 Seeding Demo Orders...');
  const customer1 = createdCustomers[0];
  if (customer1) {
    const addr1 = await prisma.address.findFirst({ where: { userId: customer1.id } });
    const sampleRice = await prisma.product.findFirst({ where: { slug: 'traditional-hand-pounded-lean-rice-500g' } });
    const sampleRagi = await prisma.product.findFirst({ where: { slug: 'organic-native-ragi-finger-millet-500g' } });

    if (addr1 && sampleRice && sampleRagi) {
      const varRice = await prisma.productVariant.findFirst({ where: { productId: sampleRice.id } });
      const varRagi = await prisma.productVariant.findFirst({ where: { productId: sampleRagi.id } });

      await prisma.order.upsert({
        where: { orderNumber: 'ORD-2026-1001' },
        update: {},
        create: {
          orderNumber: 'ORD-2026-1001',
          userId: customer1.id,
          addressId: addr1.id,
          subtotal: 185.00,
          discount: 18.50,
          tax: 8.32,
          shipping: 40.00,
          total: 214.82,
          status: OrderStatus.DELIVERED,
          notes: 'Eco-friendly paper pouch packaging requested.',
          items: {
            create: [
              {
                productId: sampleRice.id,
                variantId: varRice?.id,
                productName: sampleRice.name,
                sku: sampleRice.sku,
                quantity: 1,
                unitPrice: 110.00,
                discount: 11.00,
                tax: 4.95,
                total: 103.95,
              },
              {
                productId: sampleRagi.id,
                variantId: varRagi?.id,
                productName: sampleRagi.name,
                sku: sampleRagi.sku,
                quantity: 1,
                unitPrice: 75.00,
                discount: 7.50,
                tax: 3.37,
                total: 70.87,
              },
            ],
          },
          payments: {
            create: [
              {
                paymentMethod: PaymentMethod.RAZORPAY,
                status: PaymentStatus.PAID,
                amount: 214.82,
                transactionReference: 'pay_VistoraDemo1001',
                paidAt: new Date(),
              },
            ],
          },
        },
      });
    }
  }

  console.log('✨ Clean Rice & Grains database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
