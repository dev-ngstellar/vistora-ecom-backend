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
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789622123/black-rice-hero-banner.jpg',
      mobileImageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_front_image.webp',
      position: 'HERO_SLIDER',
      buttonText: 'Shop Rice & Grains',
      buttonLink: '/shop?category=rice-grains',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Native Millets & Supergrains',
      subtitle: 'Unpolished Organic Ragi, Kambu Kurunai, Foxtail (Thinai), Little Millet (Saamai), and native superfoods.',
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789622140/millets-hero-banner.jpg',
      mobileImageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621719/ragi_front_image.webp',
      position: 'HERO_SLIDER',
      buttonText: 'Explore Millets',
      buttonLink: '/shop?category=other-grains-millets',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Traditional Health & Wellness Staples',
      subtitle: 'Ancient grains rich in calcium, iron, and fiber for natural everyday vitality.',
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789622202/organic-farm-hero-banner.jpg',
      mobileImageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621806/kambu_kurunai_front_image.webp',
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
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_banner_showcase.webp',
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
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_front_image.webp',
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
      imageUrl: 'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621719/ragi_banner_showcase.webp',
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
    // ---------------- Subcategory 1: Varieties of Rice ----------------
    {
      name: 'Traditional Hand-Pounded Lean Rice',
      slug: 'traditional-hand-pounded-lean-rice',
      sku: 'RICE-HPL-001',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 53.00,
      compareAtPrice: 65.00,
      shortDescription: 'Minimally processed nutrient-rich Hand Pounded Lean Rice (கைக்குத்தல் அரிசி).',
      description: 'Hand pounded lean rice (கைக்குத்தல் அரிசி) is a traditional, minimally processed rice variety that retains its natural bran, nutrients and authentic flavour. Rich in fiber, vitamins and minerals compared to polished rice, making it a healthier choice for you and your family.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621837/hand_pounded_lean_rice_banner_showcase.webp',
      ],
      color: 'Lean Brown',
      colorHex: '#C4A482',
      variants: [
        { size: '500g', weight: 0.5, price: 53.00, compareAtPrice: 65.00, stock: 50, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 105.00, compareAtPrice: 130.00, stock: 50, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Heritage Karuppu Kavuni Black Rice',
      slug: 'heritage-karuppu-kavuni-black-rice',
      sku: 'RCE-KVN-005',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 71.00,
      compareAtPrice: 90.00,
      shortDescription: 'Ancient Chettinad royal Black Rice (கருப்புகவனி) packed with anthocyanin antioxidants.',
      description: 'Known as Emperor’s Forbidden Rice (கருப்புகவனி). Revered for powerful antioxidant properties, deep nutty flavor, and wholesome detox sweet porridge and pongal.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_front_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Blace_rice_back_image.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Black_rice_3rd_image.jpg.jpg',
      ],
      color: 'Anthocyanin Black',
      colorHex: '#1A1110',
      variants: [
        { size: '500g', weight: 0.5, price: 71.00, compareAtPrice: 90.00, stock: 45, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 142.00, compareAtPrice: 175.00, stock: 45, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Mappillai Samba Heritage Red Rice',
      slug: 'mappillai-samba-heritage-red-rice',
      sku: 'RCE-MPL-006',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 44.00,
      compareAtPrice: 55.00,
      shortDescription: 'Legendary Tamil Nadu strength & stamina red heritage rice (மாப்பிள்ளை சம்பா).',
      description: 'High-zinc and iron unpolished red bran rice (மாப்பிள்ளை சம்பா). Known traditionally to boost vigor, strengthen immunity, and provide sustained stamina throughout the day.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/maapillai_samba_front.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/mappilai_samba_back_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/Mapillai_samba_3rd_image.webp',
      ],
      color: 'Ruby Red',
      colorHex: '#9B111E',
      variants: [
        { size: '500g', weight: 0.5, price: 44.00, compareAtPrice: 55.00, stock: 50, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 87.00, compareAtPrice: 110.00, stock: 50, skuSuffix: '1KG' },
      ],
    },

    // ---------------- Subcategory 2: Other Grains & Millets ----------------
    {
      name: 'Organic Native Ragi (Finger Millet)',
      slug: 'organic-native-ragi-finger-millet',
      sku: 'MLT-RAG-007',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 34.00,
      compareAtPrice: 45.00,
      shortDescription: 'High-calcium unpolished organic Finger Millet / Ragi (ராகி).',
      description: 'Ragi (Finger Millet / ராகி) is a traditional, nutrient-rich whole grain known for its high calcium, fiber and plant-based protein. It is naturally grown and a perfect choice for a healthy and balanced diet for all age groups.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621719/ragi_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621806/kambu_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621719/ragi_banner_showcase.webp',
      ],
      color: 'Deep Maroon Brown',
      colorHex: '#5C1D24',
      variants: [
        { size: '500g', weight: 0.5, price: 34.00, compareAtPrice: 45.00, stock: 80, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 68.00, compareAtPrice: 85.00, stock: 80, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Traditional Kambu Kurunai (Pearl Millet Grits)',
      slug: 'traditional-kambu-kurunai-pearl-millet-grits',
      sku: 'MLT-KKR-008',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 28.00,
      compareAtPrice: 35.00,
      shortDescription: 'Unpolished broken Pearl Millet Grits / Kambu Kurunai (கம்பு குறுணை).',
      description: 'Pearl Millet Grits (Kambu Kurunai / கம்பு குறுணை) is a traditional, nutrient-rich grain known for its high fiber content, plant-based protein, essential minerals and slow-releasing energy. Ideal for porridge, upma, and adai.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621806/kambu_kurunai_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621806/kambu_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789621806/kambu_kurunai_banner_showcase.webp',
      ],
      color: 'Millet Speckled',
      colorHex: '#8F9779',
      variants: [
        { size: '500g', weight: 0.5, price: 28.00, compareAtPrice: 35.00, stock: 75, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 56.00, compareAtPrice: 70.00, stock: 75, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Traditional Kambu (Pearl Millet / Bajra)',
      slug: 'traditional-kambu-pearl-millet-bajra',
      sku: 'MLT-KMB-009',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 28.00,
      compareAtPrice: 35.00,
      shortDescription: 'High-iron energizing native Pearl Millet (கம்பு) grains.',
      description: 'Mineral powerhouse rich in iron, zinc, and calcium (கம்பு). Traditional staple for fermenting cooling summer Kambu Koozh, dosas, and nutritious flatbreads.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_front_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_back_image.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/kambu_3rd_image.webp',
      ],
      color: 'Grey Green',
      colorHex: '#708090',
      variants: [
        { size: '500g', weight: 0.5, price: 28.00, compareAtPrice: 35.00, stock: 75, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 56.00, compareAtPrice: 70.00, stock: 75, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Organic Red Cholam (Red Sorghum)',
      slug: 'organic-red-cholam-red-sorghum',
      sku: 'MLT-RCH-010',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 33.00,
      compareAtPrice: 42.00,
      shortDescription: 'Unpolished antioxidant-rich Red Cholam (சிவப்பு சோளம்) whole grains.',
      description: 'High in dietary fiber, polyphenols, and plant-based protein (சிவப்பு சோளம்). Ideal for diabetic-friendly meals, traditional breakfast porridge (Koozh), and gluten-free rotis.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_front.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/Red_cholam_3rd_image.jpg.jpg',
      ],
      color: 'Red Sorghum',
      colorHex: '#8B2500',
      variants: [
        { size: '500g', weight: 0.5, price: 33.00, compareAtPrice: 42.00, stock: 60, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 66.00, compareAtPrice: 80.00, stock: 60, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Organic White Cholam (White Jowar)',
      slug: 'organic-white-cholam-white-jowar',
      sku: 'MLT-WCH-011',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 29.00,
      compareAtPrice: 38.00,
      shortDescription: 'Premium gluten-free White Cholam (வெள்ளை சோளம்) whole grains.',
      description: 'Rich in essential minerals including magnesium, copper, and calcium (வெள்ளை சோளம்). Ground fresh for soft, nutritious jowar bhakri, rotis, and wholesome grain bowls.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_Front.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017712/White_cholam_back_image.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/White_cholam_3rd_image.jpg.jpg',
      ],
      color: 'Pearl Ivory',
      colorHex: '#FFFFF0',
      variants: [
        { size: '500g', weight: 0.5, price: 29.00, compareAtPrice: 38.00, stock: 55, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 57.00, compareAtPrice: 72.00, stock: 55, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Traditional Saamai (Little Millet)',
      slug: 'traditional-saamai-little-millet',
      sku: 'MLT-SMA-012',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 99.00,
      compareAtPrice: 125.00,
      shortDescription: 'Unpolished native Little Millet (சாமை) for healthy daily meals.',
      description: 'Packed with B-complex vitamins, iron, and dietary fiber (சாமை). A delicious low-glycemic replacement for white rice in Pongal, Khichdi, and Upma.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017708/Saamai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017713/saamai_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Pale Golden',
      colorHex: '#EEE8AA',
      variants: [
        { size: '500g', weight: 0.5, price: 99.00, compareAtPrice: 125.00, stock: 70, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 197.00, compareAtPrice: 245.00, stock: 70, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Organic Thinai (Foxtail Millet)',
      slug: 'organic-thinai-foxtail-millet',
      sku: 'MLT-THN-013',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 50.00,
      compareAtPrice: 65.00,
      shortDescription: 'Nutrient-dense unpolished Foxtail Millet (திணை).',
      description: 'High in protein and dietary fiber (திணை), supports steady glucose control and heart health. Perfect for millet payasam, idli batter, and quick pulao.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017709/Thinai_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Golden Yellow',
      colorHex: '#FFD700',
      variants: [
        { size: '500g', weight: 0.5, price: 50.00, compareAtPrice: 65.00, stock: 65, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 100.00, compareAtPrice: 125.00, stock: 65, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Organic Native Kollu (Horse Gram)',
      slug: 'organic-native-kollu-horse-gram',
      sku: 'PL-KLU-014',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 47.00,
      compareAtPrice: 60.00,
      shortDescription: 'High-protein super-pulse Horse Gram (கொள்ளு) for stamina & metabolism.',
      description: 'Traditional super-pulse rich in iron, polyphenols, and plant protein (கொள்ளு). Renowned in Ayurvedic cooking for medicinal soup (Kollu Rasam) and weight management.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_frontside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_backside.webp',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/kollu_3rd_image.webp',
      ],
      color: 'Rust Brown',
      colorHex: '#8B4513',
      variants: [
        { size: '500g', weight: 0.5, price: 47.00, compareAtPrice: 60.00, stock: 80, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 93.00, compareAtPrice: 115.00, stock: 80, skuSuffix: '1KG' },
      ],
    },
    {
      name: 'Organic Varagu (Kodo Millet)',
      slug: 'organic-varagu-kodo-millet',
      sku: 'MLT-VRG-015',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 51.00,
      compareAtPrice: 65.00,
      shortDescription: 'Low-glycemic unpolished Kodo Millet (வரகு) for gut wellness.',
      description: 'Rich in lecithin and dietary fiber (வரகு). Light on digestion, stabilizes blood sugar levels, and cooks into fluffy rice dishes, upma, and bisi bele bath.',
      images: [
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017711/varugu_front_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varagu_back_image_11zon.jpg.jpg',
        'https://res.cloudinary.com/ggvs7siw/image/upload/v1789017710/varugu_3rd_image_11zon.jpg.jpg',
      ],
      color: 'Buff Brown',
      colorHex: '#D2B48C',
      variants: [
        { size: '500g', weight: 0.5, price: 51.00, compareAtPrice: 65.00, stock: 65, skuSuffix: '500G' },
        { size: '1kg', weight: 1.0, price: 102.00, compareAtPrice: 130.00, stock: 65, skuSuffix: '1KG' },
      ],
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
          create: item.variants.map((v) => ({
            sku: `${item.sku}-${v.skuSuffix}`,
            size: v.size,
            weight: v.weight,
            color: item.color,
            colorHex: item.colorHex,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    // Create inventory record linked to each variant
    for (const variant of product.variants) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          sku: variant.sku,
          availableStock: variant.stock,
          minimumStock: 5,
          reorderLevel: 10,
        },
      });
    }
  }

  console.log(`✅ Successfully seeded ${productDataList.length} pure Rice & Grain products with 500g & 1kg variants!`);

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
    const sampleRice = await prisma.product.findFirst({ where: { slug: 'traditional-hand-pounded-lean-rice' } });
    const sampleRagi = await prisma.product.findFirst({ where: { slug: 'organic-native-ragi-finger-millet' } });

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
          subtotal: 87.00,
          discount: 8.70,
          tax: 3.91,
          shipping: 40.00,
          total: 122.21,
          status: OrderStatus.DELIVERED,
          notes: 'Eco-friendly paper pouch packaging requested.',
          items: {
            create: [
              {
                productId: sampleRice.id,
                variantId: varRice?.id,
                productName: sampleRice.name,
                sku: varRice?.sku || sampleRice.sku,
                quantity: 1,
                unitPrice: 53.00,
                discount: 5.30,
                tax: 2.38,
                total: 50.08,
              },
              {
                productId: sampleRagi.id,
                variantId: varRagi?.id,
                productName: sampleRagi.name,
                sku: varRagi?.sku || sampleRagi.sku,
                quantity: 1,
                unitPrice: 34.00,
                discount: 3.40,
                tax: 1.53,
                total: 32.13,
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
