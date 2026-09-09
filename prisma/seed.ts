import { AccountStatus, AddressType, AuthProvider, BrandStatus, CategoryStatus, CouponStatus, CouponType, OrderStatus, PaymentMethod, PaymentStatus, ProductStatus, ProductVisibility, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting Vistora Commerce Database Seeding...');

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

  // 4.1 Seed Banners for Hero Slider
  console.log('🖼️ Seeding Hero Slider Banners...');
  const newBanners = [
    {
      title: 'Fresh Rice & Organic Grains',
      subtitle: 'Premium Royal Basmati, organic Sona Masoori, red rice, and unrefined grains delivered fresh.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920&auto=format&fit=crop&q=80',
      mobileImageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      position: 'HERO_SLIDER',
      buttonText: 'Shop Rice & Grains',
      buttonLink: '/shop?category=rice-grains',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Authentic Spices & Masala Powders',
      subtitle: 'Pure Guntur chilli powder, Salem turmeric, roasted coriander, and rich home-style sambar masala.',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920&auto=format&fit=crop&q=80',
      mobileImageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      position: 'HERO_SLIDER',
      buttonText: 'Explore Spices',
      buttonLink: '/shop?category=spices-masala-powders',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'Health Mix & Multigrain Nutrition',
      subtitle: 'Traditional Sathu Maavu, sprouted millet drinks, and special nutrition mixes for kids and family.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&auto=format&fit=crop&q=80',
      mobileImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      position: 'HERO_SLIDER',
      buttonText: 'Shop Health Mix',
      buttonLink: '/shop?category=health-mix-nutrition',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const b of newBanners) {
    await prisma.banner.create({ data: b });
  }

  // 5. Seed Parent Categories & Subcategories
  console.log('📁 Seeding Main Categories & Subcategories...');

  // Parent Category 1: Rice & Grains
  const catRiceGrains = await prisma.category.create({
    data: {
      name: 'Rice & Grains',
      slug: 'rice-grains',
      description: 'Premium quality raw, boiled, basmati rice varieties and wholesome unrefined grains',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1000&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subVarietiesOfRice = await prisma.category.create({
    data: {
      name: 'Varieties of Rice',
      slug: 'varieties-of-rice',
      parentId: catRiceGrains.id,
      description: 'Basmati, Sona Masoori, Ponni, Red Rice, and traditional hand-pounded rice varieties',
      imageUrl: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subOtherGrains = await prisma.category.create({
    data: {
      name: 'Other Grains & Millets',
      slug: 'other-grains-millets',
      parentId: catRiceGrains.id,
      description: 'Whole wheat, Ragi, Foxtail, Pearl Millet (Bajra), Oats, and native super-grains',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  // Parent Category 2: Spices & Masala Powders
  const catSpices = await prisma.category.create({
    data: {
      name: 'Spices & Masala Powders',
      slug: 'spices-masala-powders',
      description: 'Authentic stone-ground single spices, vibrant chilli, turmeric, coriander, and curry masalas',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1000&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  const subRedChilli = await prisma.category.create({
    data: {
      name: 'Red Chilli Powder',
      slug: 'red-chilli-powder',
      parentId: catSpices.id,
      description: 'Guntur hot chilli powder, Kashmiri color chilli powder, and organic ground chilli',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subTurmeric = await prisma.category.create({
    data: {
      name: 'Turmeric Powder',
      slug: 'turmeric-powder',
      parentId: catSpices.id,
      description: 'High curcumin Salem & Lakadong pure organic turmeric powder',
      imageUrl: 'https://images.unsplash.com/photo-1615485290176-65476a2eb245?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  const subCoriander = await prisma.category.create({
    data: {
      name: 'Coriander Powder',
      slug: 'coriander-powder',
      parentId: catSpices.id,
      description: 'Aromatic roasted coriander seed powder for rich curries',
      imageUrl: 'https://images.unsplash.com/photo-1509358217951-4ff270043167?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
    },
  });

  const subOtherMasala = await prisma.category.create({
    data: {
      name: 'Other Masala Powders',
      slug: 'other-masala-powders',
      parentId: catSpices.id,
      description: 'Sambar powder, Garam Masala, Rasam powder, Chettinad curry powder, and specialty spice mixes',
      imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 4,
    },
  });

  // Parent Category 3: Health Mix & Nutrition
  const catHealthMix = await prisma.category.create({
    data: {
      name: 'Health Mix & Nutrition',
      slug: 'health-mix-nutrition',
      description: 'Nourishing traditional multigrain health powders, sprouted millet drink mixes, and kids nutrition',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
    },
  });

  const subHealthMix = await prisma.category.create({
    data: {
      name: 'Health Mix',
      slug: 'health-mix',
      parentId: catHealthMix.id,
      description: 'Classic multigrain Sathu Maavu & energy health drink mix',
      imageUrl: 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const subMilletHealthMix = await prisma.category.create({
    data: {
      name: 'Millet Health Mix',
      slug: 'millet-health-mix',
      parentId: catHealthMix.id,
      description: 'Sprouted 5-millet health mix, diabetic-friendly low GI millet drinks',
      imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  const subTraditionalMixes = await prisma.category.create({
    data: {
      name: 'Traditional / Nutrition Mixes',
      slug: 'traditional-nutrition-mixes',
      parentId: catHealthMix.id,
      description: 'Sprouted Ragi almond mix, herbal protein formulations, and Ayurvedic wellness powders',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
    },
  });

  const subKidsHealthMix = await prisma.category.create({
    data: {
      name: 'Kids’ Health Mix',
      slug: 'kids-health-mix',
      parentId: catHealthMix.id,
      description: 'Sprouted malt, cocoa health drink mix, and junior growth nutrition powders',
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
      status: CategoryStatus.ACTIVE,
      sortOrder: 4,
    },
  });

  // 6. Seed Brands & Suppliers
  console.log('🏷️ Seeding Brands & Retailer Suppliers...');
  const brandVistoraOrganics = await prisma.brand.create({
    data: {
      name: 'Vistora Organics',
      slug: 'vistora-organics',
      description: '100% Certified Organic Grains, Heritage Rice & Pure Spice Formulations',
      website: 'https://vistoracommerce.com',
      address: 'Vistora Organic Mills, 12, Food Park Estate, Bengaluru, Karnataka - 560099',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  const brandGramiyaa = await prisma.brand.create({
    data: {
      name: 'Gramiyaa Naturals',
      slug: 'gramiyaa-naturals',
      description: 'Traditional Stone-Ground Spices & Cold-Milled Heritage Grains',
      website: 'https://gramiyaanaturals.com',
      address: 'Gramiyaa Agro Works, 45, Mill Road, Erode, Tamil Nadu - 638001',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  const brandNutriBloom = await prisma.brand.create({
    data: {
      name: 'NutriBloom Herbal',
      slug: 'nutribloom-herbal',
      description: 'Authentic Ayurvedic Multigrain Sathu Maavu & Sprouted Millet Nutrition',
      website: 'https://nutribloomherbal.com',
      address: 'NutriBloom Health Care, 88, Heritage Lane, Madurai, Tamil Nadu - 625001',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  // 7. Seed Products
  console.log('🌾 Seeding Realistic Food, Spice & Health Mix Products...');

  const productDataList = [
    // ---------------- Rice & Grains - Varieties of Rice (4) ----------------
    {
      name: 'Premium Royal Basmati Rice (1kg)',
      slug: 'premium-royal-basmati-rice-1kg',
      sku: 'RICE-BAS-001',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 180.00,
      compareAtPrice: 220.00,
      shortDescription: 'Extra-long grain aromatic Royal Basmati Rice (1kg pack).',
      description: 'Aged to perfection for exquisite aroma, fluffy texture, and non-sticky cooking. Ideal for biryanis and special festive meals.',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      color: 'Pearl White',
      colorHex: '#FFFFFF',
      stock: 60,
    },
    {
      name: 'Organic Sona Masoori Raw Rice (5kg)',
      slug: 'organic-sona-masoori-raw-rice-5kg',
      sku: 'RICE-SON-002',
      categoryId: subVarietiesOfRice.id,
      brandId: brandGramiyaa.id,
      price: 399.00,
      compareAtPrice: 480.00,
      shortDescription: 'Lightweight aromatic medium-grain Sona Masoori raw rice (5kg).',
      description: 'Cultivated organically without chemical fertilizers. Lightweight, easy to digest, perfect for daily meals and rice dishes.',
      image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
      color: 'Off-White',
      colorHex: '#FAF9F6',
      stock: 45,
    },
    {
      name: 'Traditional Hand-Pounded Red Rice (1kg)',
      slug: 'traditional-hand-pounded-red-rice-1kg',
      sku: 'RICE-RED-003',
      categoryId: subVarietiesOfRice.id,
      brandId: brandVistoraOrganics.id,
      price: 120.00,
      compareAtPrice: 150.00,
      shortDescription: 'Nutrient-dense bran rich red rice hand-milled naturally (1kg).',
      description: 'Rich in antioxidants, iron, and fiber. Helps regulate blood sugar and provides sustained energy throughout the day.',
      image: 'https://images.unsplash.com/photo-1568290747447-3d12d4d9ce25?w=800&auto=format&fit=crop&q=80',
      color: 'Reddish Brown',
      colorHex: '#8B0000',
      stock: 50,
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
      description: 'A staple across South Indian households, processed under strict quality controls for soft texture and great taste.',
      image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=800&auto=format&fit=crop&q=80',
      color: 'Classic White',
      colorHex: '#F5F5F5',
      stock: 40,
    },

    // ---------------- Other Grains & Millets (9) ----------------
    {
      name: 'Organic Red Cholam (Red Sorghum) - 1kg',
      slug: 'organic-red-cholam-red-sorghum-1kg',
      sku: 'MLT-RCH-001',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 95.00,
      compareAtPrice: 120.00,
      shortDescription: 'Unpolished antioxidant-rich Red Cholam (Red Sorghum) whole grains (1kg).',
      description: 'High in dietary fiber, polyphenols, and plant-based protein. Ideal for diabetic-friendly meals, traditional breakfast porridge (Koozh), and gluten-free rotis.',
      image: '/products-image all/millets/Red cholam front image_11zon.jpg.jpeg',
      color: 'Red Sorghum',
      colorHex: '#8B2500',
      stock: 60,
    },
    {
      name: 'Organic White Cholam (White Jowar) - 1kg',
      slug: 'organic-white-cholam-white-jowar-1kg',
      sku: 'MLT-WCH-002',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 85.00,
      compareAtPrice: 110.00,
      shortDescription: 'Premium gluten-free White Cholam (Jowar) whole grains (1kg).',
      description: 'Rich in essential minerals including magnesium, copper, and calcium. Ground fresh for soft, nutritious jowar bhakri, rotis, and wholesome grain bowls.',
      image: '/products-image all/millets/white cholam front image_11zon.jpg.jpeg',
      color: 'Pearl Ivory',
      colorHex: '#FFFFF0',
      stock: 55,
    },
    {
      name: 'Traditional Saamai (Little Millet) - 1kg',
      slug: 'traditional-saamai-little-millet-1kg',
      sku: 'MLT-SMA-003',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 105.00,
      compareAtPrice: 135.00,
      shortDescription: 'Unpolished native Little Millet (Saamai) for healthy daily meals (1kg).',
      description: 'Packed with B-complex vitamins, iron, and dietary fiber. A delicious low-glycemic replacement for white rice in Pongal, Khichdi, and Upma.',
      image: '/products-image all/millets/Saamai front image_11zon.jpg.jpeg',
      color: 'Pale Golden',
      colorHex: '#EEE8AA',
      stock: 70,
    },
    {
      name: 'Organic Thinai (Foxtail Millet) - 1kg',
      slug: 'organic-thinai-foxtail-millet-1kg',
      sku: 'MLT-THN-004',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 110.00,
      compareAtPrice: 140.00,
      shortDescription: 'Nutrient-dense unpolished Foxtail Millet (Thinai) (1kg).',
      description: 'High in protein and dietary fiber, supports steady glucose control and heart health. Perfect for millet payasam, idli batter, and quick pulao.',
      image: '/products-image all/millets/Thinai front image_11zon.jpg.jpeg',
      color: 'Golden Yellow',
      colorHex: '#FFD700',
      stock: 65,
    },
    {
      name: 'Traditional Kambu (Pearl Millet / Bajra) - 1kg',
      slug: 'traditional-kambu-pearl-millet-bajra-1kg',
      sku: 'MLT-KMB-005',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 80.00,
      compareAtPrice: 100.00,
      shortDescription: 'High-iron energizing native Pearl Millet (Kambu) grains (1kg).',
      description: 'Mineral powerhouse rich in iron, zinc, and calcium. Traditional staple for fermenting cooling summer Kambu Koozh, dosas, and winter flatbreads.',
      image: '/products-image all/millets/kambu front image.webp',
      color: 'Grey Green',
      colorHex: '#708090',
      stock: 75,
    },
    {
      name: 'Heritage Karuppu Kavuni Black Rice (Emperor’s Rice) - 1kg',
      slug: 'heritage-karuppu-kavuni-black-rice-1kg',
      sku: 'RCE-KVN-006',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 160.00,
      compareAtPrice: 200.00,
      shortDescription: 'Ancient Chettinad royal Black Rice packed with anthocyanin antioxidants (1kg).',
      description: 'Known as Emperor’s Forbidden Rice. Revered for powerful antioxidant properties, deep nutty flavor, and wholesome detox sweet porridge and pongal.',
      image: '/products-image all/millets/Black rice front image.jpg.jpeg',
      color: 'Anthocyanin Black',
      colorHex: '#1A1110',
      stock: 45,
    },
    {
      name: 'Organic Native Kollu (Horse Gram) - 1kg',
      slug: 'organic-native-kollu-horse-gram-1kg',
      sku: 'PL-KLU-007',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 90.00,
      compareAtPrice: 115.00,
      shortDescription: 'High-protein super-pulse Horse Gram for stamina & metabolism (1kg).',
      description: 'Traditional super-pulse rich in iron, polyphenols, and plant protein. Renowned in Ayurvedic cooking for medicinal soup (Kollu Rasam) and weight management.',
      image: '/products-image all/millets/kollu frontside.webp',
      color: 'Rust Brown',
      colorHex: '#8B4513',
      stock: 80,
    },
    {
      name: 'Mappillai Samba Heritage Red Rice (Bridegroom Rice) - 1kg',
      slug: 'mappillai-samba-heritage-red-rice-1kg',
      sku: 'RCE-MPL-008',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 140.00,
      compareAtPrice: 175.00,
      shortDescription: 'Legendary Tamil Nadu strength & stamina red heritage rice (1kg).',
      description: 'High-zinc and iron unpolished red bran rice. Known traditionally to boost vigor, strengthen immunity, and provide sustained stamina throughout the day.',
      image: '/products-image all/millets/maapillai samba front.webp',
      color: 'Ruby Red',
      colorHex: '#9B111E',
      stock: 50,
    },
    {
      name: 'Organic Varagu (Kodo Millet) - 1kg',
      slug: 'organic-varagu-kodo-millet-1kg',
      sku: 'MLT-VRG-009',
      categoryId: subOtherGrains.id,
      brandId: brandVistoraOrganics.id,
      price: 105.00,
      compareAtPrice: 135.00,
      shortDescription: 'Low-glycemic unpolished Kodo Millet (Varagu) for gut wellness (1kg).',
      description: 'Rich in lecithin and dietary fiber. Light on digestion, stabilizes blood sugar levels, and cooks into fluffy rice dishes, upma, and bisi bele bath.',
      image: '/products-image all/millets/varugu front image_11zon.jpg.jpeg',
      color: 'Buff Brown',
      colorHex: '#D2B48C',
      stock: 65,
    },

    // ---------------- Spices & Masala Powders - Red Chilli Powder (2) ----------------
    {
      name: 'Guntur Hot Red Chilli Powder (250g)',
      slug: 'guntur-hot-red-chilli-powder-250g',
      sku: 'SPC-CHL-009',
      categoryId: subRedChilli.id,
      brandId: brandGramiyaa.id,
      price: 140.00,
      compareAtPrice: 175.00,
      shortDescription: 'Fiery pungent Guntur stemless chilli powder (250g).',
      description: 'Sun-dried Andhra Guntur chillies ground slowly to retain spicy essential oils and deep red tone.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
      color: 'Fiery Red',
      colorHex: '#FF0000',
      stock: 80,
    },
    {
      name: 'Kashmiri Bright Red Chilli Powder (200g)',
      slug: 'kashmiri-bright-red-chilli-powder-200g',
      sku: 'SPC-KSH-010',
      categoryId: subRedChilli.id,
      brandId: brandVistoraOrganics.id,
      price: 165.00,
      compareAtPrice: 200.00,
      shortDescription: 'Mild spice high natural color Kashmiri chilli powder (200g).',
      description: 'Gives rich red color to gravy dishes without excessive heat. 100% natural without artificial colors.',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80',
      color: 'Deep Crimson',
      colorHex: '#DC143C',
      stock: 65,
    },

    // ---------------- Spices & Masala Powders - Turmeric Powder (2) ----------------
    {
      name: 'Pure Salem Organic Turmeric Powder (250g)',
      slug: 'pure-salem-organic-turmeric-powder-250g',
      sku: 'SPC-TUR-011',
      categoryId: subTurmeric.id,
      brandId: brandVistoraOrganics.id,
      price: 125.00,
      compareAtPrice: 150.00,
      shortDescription: 'High aroma cold-ground Salem turmeric powder (250g).',
      description: 'Packed with natural immunity-boosting curcumin. Lab-tested for zero lead adulteration and pure aroma.',
      image: 'https://images.unsplash.com/photo-1615485290176-65476a2eb245?w=800&auto=format&fit=crop&q=80',
      color: 'Bright Yellow',
      colorHex: '#FFCC00',
      stock: 90,
    },
    {
      name: 'High Curcumin Lakadong Turmeric Powder (100g)',
      slug: 'high-curcumin-lakadong-turmeric-powder-100g',
      sku: 'SPC-LKD-012',
      categoryId: subTurmeric.id,
      brandId: brandGramiyaa.id,
      price: 180.00,
      compareAtPrice: 220.00,
      shortDescription: '7%+ Curcumin content Meghalaya Lakadong turmeric (100g).',
      description: 'Harvested from Meghalaya hills, known globally for the highest natural curcumin concentration.',
      image: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=800&auto=format&fit=crop&q=80',
      color: 'Golden Amber',
      colorHex: '#FF8C00',
      stock: 40,
    },

    // ---------------- Spices & Masala Powders - Coriander Powder (2) ----------------
    {
      name: 'Cold-Pressed Roasted Coriander Powder (250g)',
      slug: 'cold-pressed-roasted-coriander-powder-250g',
      sku: 'SPC-COR-013',
      categoryId: subCoriander.id,
      brandId: brandGramiyaa.id,
      price: 110.00,
      compareAtPrice: 135.00,
      shortDescription: 'Freshly roasted cold-ground Dhaniya powder (250g).',
      description: 'Slow-roasted coriander seeds ground fresh for citrusy aroma and rich thick gravy texture.',
      image: 'https://images.unsplash.com/photo-1509358217951-4ff270043167?w=800&auto=format&fit=crop&q=80',
      color: 'Olive Khaki',
      colorHex: '#808000',
      stock: 75,
    },
    {
      name: 'Organic Green Coriander Powder (500g)',
      slug: 'organic-green-coriander-powder-500g',
      sku: 'SPC-COR-014',
      categoryId: subCoriander.id,
      brandId: brandVistoraOrganics.id,
      price: 199.00,
      compareAtPrice: 240.00,
      shortDescription: '100% Organic aromatic coriander seed powder value pack (500g).',
      description: 'Pure certified organic dhaniya powder, essential for everyday Indian dal and curry prep.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      color: 'Earthy Green',
      colorHex: '#556B2F',
      stock: 50,
    },

    // ---------------- Spices & Masala Powders - Other Masala Powders (3) ----------------
    {
      name: 'Grandma Traditional South Indian Sambar Powder (200g)',
      slug: 'grandma-traditional-sambar-powder-200g',
      sku: 'SPC-SAM-015',
      categoryId: subOtherMasala.id,
      brandId: brandGramiyaa.id,
      price: 150.00,
      compareAtPrice: 185.00,
      shortDescription: 'Authentic 12-spice traditional home style sambar powder (200g).',
      description: 'Hand-roasted spices blending coriander, red chilli, fenugreek, toor dal, and asafoetida.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      color: 'Rustic Orange',
      colorHex: '#D2691E',
      stock: 85,
    },
    {
      name: 'Authentic Royal Garam Masala Blend (100g)',
      slug: 'authentic-royal-garam-masala-blend-100g',
      sku: 'SPC-GAR-016',
      categoryId: subOtherMasala.id,
      brandId: brandVistoraOrganics.id,
      price: 160.00,
      compareAtPrice: 195.00,
      shortDescription: 'Intense fragrance 15-whole spice garam masala (100g).',
      description: 'Contains cardamoms, cinnamon, star anise, cloves, nutmeg, and black pepper for biryanis.',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
      color: 'Warm Cinnamon',
      colorHex: '#7B3F00',
      stock: 60,
    },
    {
      name: 'Chettinad Spicy Curry Masala Powder (200g)',
      slug: 'chettinad-spicy-curry-masala-powder-200g',
      sku: 'SPC-CHT-017',
      categoryId: subOtherMasala.id,
      brandId: brandGramiyaa.id,
      price: 155.00,
      compareAtPrice: 190.00,
      shortDescription: 'Bold aromatic Chettinad style spice mix (200g).',
      description: 'Infused with fennel, stone flower (kalpasi), black pepper, and dry roasted red chillies.',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
      color: 'Deep Terracotta',
      colorHex: '#CC4E5C',
      stock: 45,
    },

    // ---------------- Health Mix & Nutrition - Health Mix (2) ----------------
    {
      name: 'Multigrain Health Mix Drink Powder (Sathu Maavu) (500g)',
      slug: 'multigrain-health-mix-drink-powder-500g',
      sku: 'HLT-MIX-018',
      categoryId: subHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 249.00,
      compareAtPrice: 299.00,
      shortDescription: '18-ingredient sprouted traditional health drink powder (500g).',
      description: 'Contains sprouted ragi, wheat, green gram, almonds, cardamom, and cashews. 100% natural, zero preservatives.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      color: 'Creamy Tan',
      colorHex: '#D2B48C',
      stock: 100,
    },
    {
      name: '24 Grains Superfood Energy Health Drink (1kg)',
      slug: '24-grains-superfood-energy-health-drink-1kg',
      sku: 'HLT-MIX-019',
      categoryId: subHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 450.00,
      compareAtPrice: 550.00,
      shortDescription: 'Complete family wellness 24 multigrain energy mix (1kg).',
      description: 'Ideal morning nutrition porridge for adults, senior citizens, and active lifestyle individuals.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      color: 'Natural Beige',
      colorHex: '#F5F5DC',
      stock: 75,
    },

    // ---------------- Health Mix & Nutrition - Millet Health Mix (2) ----------------
    {
      name: 'Sprouted 5-Millet Power Health Drink Mix (500g)',
      slug: 'sprouted-5-millet-power-health-drink-mix-500g',
      sku: 'HLT-MLT-020',
      categoryId: subMilletHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 279.00,
      compareAtPrice: 340.00,
      shortDescription: 'Sprouted Ragi, Foxtail, Kodo, Little & Barnyard millet blend (500g).',
      description: 'Sprouted for maximum nutrient bioavailability. Rich in dietary fiber, protein, and essential minerals.',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
      color: 'Earthy Brown',
      colorHex: '#8B5A2B',
      stock: 65,
    },
    {
      name: 'Diabetic Care Organic Millet Health Drink (500g)',
      slug: 'diabetic-care-organic-millet-health-drink-500g',
      sku: 'HLT-MLT-021',
      categoryId: subMilletHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 299.00,
      compareAtPrice: 360.00,
      shortDescription: 'Low GI high fiber sugar-free millet nutrition mix (500g).',
      description: 'Specially formulated with fenugreek seeds, roasted chana, and millets to support stable blood sugar levels.',
      image: 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?w=800&auto=format&fit=crop&q=80',
      color: 'Sand Ochre',
      colorHex: '#CC7722',
      stock: 50,
    },

    // ---------------- Health Mix & Nutrition - Traditional / Nutrition Mixes (2) ----------------
    {
      name: 'Traditional Sprouted Ragi & Almond Porridge Mix (500g)',
      slug: 'traditional-sprouted-ragi-almond-porridge-mix-500g',
      sku: 'HLT-TRD-022',
      categoryId: subTraditionalMixes.id,
      brandId: brandNutriBloom.id,
      price: 235.00,
      compareAtPrice: 280.00,
      shortDescription: 'Hand-sprouted Ragi enriched with California almonds & cardamom (500g).',
      description: 'Traditional recipe for bone health and sustained stamina. Easy to cook in milk or water in 5 minutes.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      color: 'Deep Cocoa',
      colorHex: '#4A2C11',
      stock: 80,
    },
    {
      name: 'Ayurvedic Herbal Protein & Ashwagandha Health Mix (400g)',
      slug: 'ayurvedic-herbal-protein-ashwagandha-health-mix-400g',
      sku: 'HLT-TRD-023',
      categoryId: subTraditionalMixes.id,
      brandId: brandNutriBloom.id,
      price: 380.00,
      compareAtPrice: 450.00,
      shortDescription: 'Plant protein infused with organic Ashwagandha & Shatavari (400g).',
      description: 'Enhances vitality, reduces daily stress, and improves muscle recovery naturally.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      color: 'Herbal Beige',
      colorHex: '#C5B358',
      stock: 40,
    },

    // ---------------- Health Mix & Nutrition - Kids’ Health Mix (2) ----------------
    {
      name: 'Kids Power Grow Sprouted Malt & Cocoa Mix (500g)',
      slug: 'kids-power-grow-sprouted-malt-cocoa-mix-500g',
      sku: 'HLT-KID-024',
      categoryId: subKidsHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 289.00,
      compareAtPrice: 350.00,
      shortDescription: 'Delicious natural cocoa & sprouted malt health drink for kids (500g).',
      description: 'Packed with natural brain and growth nutrients. Kids love the rich chocolate taste without artificial white sugar.',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80',
      color: 'Chocolate Brown',
      colorHex: '#3D2314',
      stock: 90,
    },
    {
      name: 'Junior Nutri-Bites Organic Nuts & Sprouted Ragi Porridge (400g)',
      slug: 'junior-nutri-bites-nuts-ragi-porridge-400g',
      sku: 'HLT-KID-025',
      categoryId: subKidsHealthMix.id,
      brandId: brandNutriBloom.id,
      price: 265.00,
      compareAtPrice: 320.00,
      shortDescription: 'Gentle easy-to-digest sprouted ragi with almond powder for toddlers (400g).',
      description: 'Ideal starting solid food and growth porridge for growing children. Rich in natural iron and calcium.',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=80',
      color: 'Soft Chestnut',
      colorHex: '#954535',
      stock: 60,
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
          create: [
            {
              imageUrl: item.image,
              isPrimary: true,
              sortOrder: 1,
            },
          ],
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

  console.log(`✅ Successfully seeded ${productDataList.length} fresh products!`);

  // 8. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      title: 'Welcome 10% Discount',
      description: 'Get 10% off on your first order of organic grains, spices & health mixes',
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

  // 9. Seed Demo Orders & Order Items
  console.log('🛒 Seeding Demo Orders with Supplier Relationships...');
  const customer1 = createdCustomers[0];
  if (customer1) {
    const addr1 = await prisma.address.findFirst({ where: { userId: customer1.id } });
    const sampleRice = await prisma.product.findFirst({ where: { slug: 'premium-royal-basmati-rice-1kg' } });
    const sampleSpices = await prisma.product.findFirst({ where: { slug: 'guntur-hot-red-chilli-powder-250g' } });

    if (addr1 && sampleRice && sampleSpices) {
      const varRice = await prisma.productVariant.findFirst({ where: { productId: sampleRice.id } });
      const varSpices = await prisma.productVariant.findFirst({ where: { productId: sampleSpices.id } });

      await prisma.order.upsert({
        where: { orderNumber: 'ORD-2026-1001' },
        update: {},
        create: {
          orderNumber: 'ORD-2026-1001',
          userId: customer1.id,
          addressId: addr1.id,
          subtotal: 320.00,
          discount: 32.00,
          tax: 14.40,
          shipping: 40.00,
          total: 342.40,
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
                unitPrice: 180.00,
                discount: 18.00,
                tax: 8.10,
                total: 162.00,
              },
              {
                productId: sampleSpices.id,
                variantId: varSpices?.id,
                productName: sampleSpices.name,
                sku: sampleSpices.sku,
                quantity: 1,
                unitPrice: 140.00,
                discount: 14.00,
                tax: 6.30,
                total: 126.00,
              },
            ],
          },
          payments: {
            create: [
              {
                paymentMethod: PaymentMethod.RAZORPAY,
                status: PaymentStatus.PAID,
                amount: 342.40,
                transactionReference: 'pay_VistoraDemo1001',
                paidAt: new Date(),
              },
            ],
          },
        },
      });
    }
  }

  console.log('✨ Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
