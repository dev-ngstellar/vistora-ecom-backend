import { AccountStatus, AddressType, AuthProvider, BrandStatus, CategoryStatus, CouponStatus, CouponType, OrderStatus, PaymentMethod, PaymentStatus, ProductStatus, ProductVisibility, ReviewStatus, ShipmentStatus, PrismaClient, UserRole } from '@prisma/client';
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
    sales: ['read', 'write', 'export'],
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

  // 5. Seed 5 New Categories
  console.log('📁 Seeding New Product Categories...');
  const catLipsticks = await prisma.category.create({
    data: {
      name: 'Lipsticks & Lip Colors',
      slug: 'lipsticks',
      description: 'High-pigment matte, sparkle, satin and 2-tone luxury lipsticks',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  const catLipGloss = await prisma.category.create({
    data: {
      name: 'Lip Gloss & Shimmer',
      slug: 'lip-gloss',
      description: 'Ultra-shine nourishing lip glosses and shimmer finishes',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  const catKajal = await prisma.category.create({
    data: {
      name: 'Kajal & Eyeliners',
      slug: 'kajal-eyeliner',
      description: 'Handcrafted herbal kajal pots and precision colored eyeliner sticks',
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
    },
  });

  const catSkincare = await prisma.category.create({
    data: {
      name: 'Skincare & Eye Care',
      slug: 'skincare',
      description: 'Herbal dark circle correctors and under eye treatment creams',
      status: CategoryStatus.ACTIVE,
      sortOrder: 4,
    },
  });

  const catSarees = await prisma.category.create({
    data: {
      name: 'Sarees & Handloom',
      slug: 'sarees-handloom',
      description: 'Traditional South Indian Zari border silk, cotton sarees and dhotis',
      status: CategoryStatus.ACTIVE,
      sortOrder: 5,
    },
  });

  // 6. Seed Brands & Suppliers
  console.log('🏷️ Seeding Brands & Retailer Suppliers...');
  const brandVistoraLuxe = await prisma.brand.create({
    data: {
      name: 'Vistora Luxe Cosmetics',
      slug: 'vistora-luxe-cosmetics',
      description: 'High-fashion luxury cosmetics and lip formulations',
      website: 'https://vistoracommerce.com',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  const brandBbloom = await prisma.brand.create({
    data: {
      name: 'Bbloom VNatura',
      slug: 'bbloom-vnatura',
      description: 'Handcrafted 100% natural herbal skincare and Ayurvedic kajal',
      website: 'https://bbloomvnaturahandmadesoaps.com',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  const brandMST = await prisma.brand.create({
    data: {
      name: 'MST / MTS Handlooms',
      slug: 'mst-mts-handlooms',
      description: 'Authentic South Indian Zari border handloom sarees and dhotis',
      website: 'https://msthandlooms.com',
      featured: true,
      status: BrandStatus.ACTIVE,
    },
  });

  // 7. Seed Products Mapped to Local Analyzed Images
  console.log('💄 Seeding 40 Real Products...');

  const productDataList = [
    // ---------------- Lipsticks (16) ----------------
    {
      name: 'Vistora Velvet Matte Lipstick - Pink Red',
      slug: 'vistora-velvet-matte-lipstick-pink-red',
      sku: 'LP-PR-0002',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'High-pigment velvet matte lipstick in Pink Red (Code: LP-PR-0002).',
      description: 'Enriched with vitamin E and jojoba oil, this rich Pink Red lipstick provides all-day comfort and intense matte color payoff.',
      image: '/products-image all/Lipstick_LP-PR-0002_Pink-Red.jpg',
      color: 'Pink Red',
      colorHex: '#C71585',
      stock: 35,
    },
    {
      name: 'Vistora Sparkle Satin Lipstick - Sparkle Pink',
      slug: 'vistora-sparkle-satin-lipstick-sparkle-pink',
      sku: 'LP-SK-0012',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 549.00,
      compareAtPrice: 749.00,
      shortDescription: 'Dazzling sparkle finish lipstick in Sparkle Pink (Code: LP-SK-0012).',
      description: 'Micro-shimmer particles reflect light for a plump, radiant pout in vibrant Sparkle Pink.',
      image: '/products-image all/Lipstick_Sparkle-pink.jpg',
      color: 'Sparkle Pink',
      colorHex: '#FF69B4',
      stock: 28,
    },
    {
      name: 'Vistora Sparkle Luxe Lipstick - Sparkle Dark Pink',
      slug: 'vistora-sparkle-luxe-lipstick-sparkle-dark-pink',
      sku: 'LP-SD-0013',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 549.00,
      compareAtPrice: 749.00,
      shortDescription: 'Deep luminous shimmer lipstick in Sparkle Dark Pink (Code: LP-SD-0013).',
      description: 'Long-lasting deep pink lipstick infused with luminous pearl pigments.',
      image: '/products-image all/Lipstick_LP-SD-0013_Sparkle-Dark-Pink.jpg',
      color: 'Sparkle Dark Pink',
      colorHex: '#C71585',
      stock: 22,
    },
    {
      name: 'Vistora Velvet Matte Lipstick - Orange Shade',
      slug: 'vistora-velvet-matte-lipstick-orange-shade',
      sku: 'LP-OG-0008',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Bold sunburst orange lipstick (Code: LP-OG-0008).',
      description: 'A striking warm orange shade with non-drying matte texture.',
      image: '/products-image all/Lipstick_LP-OG-0008_Orange.jpg',
      color: 'Orange',
      colorHex: '#FF4500',
      stock: 30,
    },
    {
      name: 'Vistora 2-Tone Gradient Lipstick - Pink Red',
      slug: 'vistora-2-tone-gradient-lipstick-pink-red',
      sku: 'LP-TP-0017',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 599.00,
      compareAtPrice: 799.00,
      shortDescription: 'Dual-core ombre lipstick in 2-Tone Pink Red (Code: LP-TP-0017).',
      description: 'Creates an effortless Korean-style gradient lip effect in one smooth stroke.',
      image: '/products-image all/Lipstick_LP-TP-0017_2-Tone-Pink-Red.jpg',
      color: '2-Tone Pink Red',
      colorHex: '#DC143C',
      stock: 18,
    },
    {
      name: 'Vistora Royal Matte Lipstick - Wine Shade',
      slug: 'vistora-royal-matte-lipstick-wine-shade',
      sku: 'LP-WN-0010',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Rich deep plum wine lipstick (Code: LP-WN-0010).',
      description: 'Sultry wine burgundy shade ideal for evening couture looks.',
      image: '/products-image all/Lipstick_LP-WN-0010_Wine.jpg',
      color: 'Wine',
      colorHex: '#722F37',
      stock: 25,
    },
    {
      name: 'Vistora Satin Luxe Lipstick - Stylish Pink',
      slug: 'vistora-satin-luxe-lipstick-stylish-pink',
      sku: 'LP-SP-0006',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Chic bright magenta pink lipstick (Code: LP-SP-0006).',
      description: 'Flattering stylish pink shade with creamy satin luminosity.',
      image: '/products-image all/Lipstick_LP-SP-0006_Stylish-Pink.jpg',
      color: 'Stylish Pink',
      colorHex: '#FF1493',
      stock: 32,
    },
    {
      name: 'Vistora Matte Couture Lipstick - Chocolate Brown',
      slug: 'vistora-matte-couture-lipstick-chocolate-brown',
      sku: 'LP-CB-0009',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Deep earthy cocoa brown lipstick (Code: LP-CB-0009).',
      description: 'Statement chocolate brown shade with ultra-matte transfer-proof coverage.',
      image: '/products-image all/Lipstick_LP-CB-0009_Chocolate-Brown.jpg',
      color: 'Chocolate Brown',
      colorHex: '#3D2314',
      stock: 20,
    },
    {
      name: 'Vistora Matte Luxe Lipstick - Tan Brown',
      slug: 'vistora-matte-luxe-lipstick-tan-brown',
      sku: 'LP-TB-0015',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Warm neutral tan nude brown lipstick (Code: LP-TB-0015).',
      description: 'The ultimate everyday nude brown lipstick for Indian skin tones.',
      image: '/products-image all/Lipstick_LP-TB-0015_Tan-Brown.jpg',
      color: 'Tan Brown',
      colorHex: '#964B00',
      stock: 40,
    },
    {
      name: 'Vistora Couture Matte Lipstick - Manganese Violet',
      slug: 'vistora-couture-matte-lipstick-manganese-violet',
      sku: 'LP-MV-0011',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Vibrant violet orchid lipstick (Code: LP-MV-0011).',
      description: 'Fashion-forward manganese violet shade with velvety coverage.',
      image: '/products-image all/Lipstick_LP-MV-0011_Manganese-Violet.jpg',
      color: 'Manganese Violet',
      colorHex: '#8A2BE2',
      stock: 15,
    },
    {
      name: 'Vistora Luminous Satin Lipstick - Dazzling Pink',
      slug: 'vistora-luminous-satin-lipstick-dazzling-pink',
      sku: 'LP-DP-0014',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Dazzling bubblegum pink lipstick (Code: LP-DP-0014).',
      description: 'Youthful dazzling pink shade infused with shea butter moisturizers.',
      image: '/products-image all/Lipstick_LP-DP-0014_Dazzling-Pink.jpg',
      color: 'Dazzling Pink',
      colorHex: '#FF69B4',
      stock: 26,
    },
    {
      name: 'Vistora Satin Luxe Lipstick - Orange Pink',
      slug: 'vistora-satin-luxe-lipstick-orange-pink',
      sku: 'LP-OP-0004',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Coral peach orange-pink lipstick (Code: LP-OP-0004).',
      description: 'Warm coral tone combining pink elegance with orange brightness.',
      image: '/products-image all/Lipstick_LP-OP-0004_Orange-Pink.jpg',
      color: 'Orange Pink',
      colorHex: '#FF7F50',
      stock: 31,
    },
    {
      name: 'Vistora Classic Matte Lipstick - Stylish Red',
      slug: 'vistora-classic-matte-lipstick-stylish-red',
      sku: 'LP-SR-0005',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Iconic crimson red lipstick (Code: LP-SR-0005).',
      description: 'The definitive stylish red shade for glamourous occasions.',
      image: '/products-image all/Lipstick_LP-SR-0005_Stylish-Red.jpg',
      color: 'Stylish Red',
      colorHex: '#B5123B',
      stock: 45,
    },
    {
      name: 'Vistora Velvet Matte Lipstick - Orange Red',
      slug: 'vistora-velvet-matte-lipstick-orange-red',
      sku: 'LP-OR-0003',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Fiery vermillion orange red lipstick (Code: LP-OR-0003).',
      description: 'Vibrant orange-red undertones that brighten any skin tone instantly.',
      image: '/products-image all/Lipstick_LP-OR-0003_Orange-Red.jpg',
      color: 'Orange Red',
      colorHex: '#FF4500',
      stock: 24,
    },
    {
      name: 'Vistora Velvet Nude Lipstick - Dusty Nude Pink',
      slug: 'vistora-velvet-nude-lipstick-dusty-nude-pink',
      sku: 'LP-DN-0001',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 549.00,
      compareAtPrice: 749.00,
      shortDescription: 'Sophisticated mauve Dusty Nude Pink lipstick (Code: LP-DN-0001).',
      description: 'Best-selling dusty nude pink with velvety formula and hydrating feel.',
      image: '/products-image all/Lipstick_LP-DN-0001_Dusty-Nude-Pink.jpg',
      color: 'Dusty Nude Pink',
      colorHex: '#D8A7B1',
      stock: 50,
    },
    {
      name: 'Vistora Royal Velvet Lipstick - Burgundy',
      slug: 'vistora-royal-velvet-lipstick-burgundy',
      sku: 'LP-BG-0016',
      categoryId: catLipsticks.id,
      brandId: brandVistoraLuxe.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Deep opulent burgundy lipstick (Code: LP-BG-0016).',
      description: 'Rich dark burgundy shade with a smooth seamless glide.',
      image: '/products-image all/Lipstick_LP-BG-0016_Burgundy.jpg',
      color: 'Burgundy',
      colorHex: '#800020',
      stock: 19,
    },

    // ---------------- Lip Glosses (8) ----------------
    {
      name: 'Bbloom VNatura Natural Lip Gloss Set (5 Shades)',
      slug: 'bbloom-vnatura-natural-lip-gloss-set-5-shades',
      sku: 'LG-SET-0001',
      categoryId: catLipGloss.id,
      brandId: brandBbloom.id,
      price: 1299.00,
      compareAtPrice: 1699.00,
      shortDescription: 'Sparkle in every smile with Bbloom VNatura 5-color Lip Gloss Collection.',
      description: 'Handcrafted natural lip gloss set containing 5 non-sticky nourishing shades in gold applicator vials.',
      image: '/products-image all/LipGloss_Bbloom-VNatura-Set.jpg',
      color: 'Multi Shade Set',
      colorHex: '#E65C00',
      stock: 25,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Peach',
      slug: 'vistora-glass-shine-lip-gloss-peach',
      sku: 'LG-PC-0003',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Ultra-glossy peach lip lacquer with gold applicator (Code: LG-PC-0003).',
      description: 'High-shine glass finish in delicate warm peach tone.',
      image: '/products-image all/LipGloss_LG-PC-0003_Peach.jpg',
      color: 'Peach',
      colorHex: '#FFDAB9',
      stock: 30,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Maroon',
      slug: 'vistora-glass-shine-lip-gloss-maroon',
      sku: 'LG-MR-0002',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Deep gloss burgundy maroon lip elixir (Code: LG-MR-0002).',
      description: 'Rich maroon tint providing plump mirror-like shine.',
      image: '/products-image all/LipGloss_LG-MR-0002_Maroon.jpg',
      color: 'Maroon',
      colorHex: '#800000',
      stock: 22,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Pink',
      slug: 'vistora-glass-shine-lip-gloss-pink',
      sku: 'LG-PK-0007',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Fresh glossy rose pink lip lacquer (Code: LG-PK-0007).',
      description: 'Hydrating light pink gloss with glass-reflection finish.',
      image: '/products-image all/LipGloss_LG-PK-0007_Pink.jpg',
      color: 'Pink',
      colorHex: '#FFC0CB',
      stock: 35,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Grape Wine',
      slug: 'vistora-glass-shine-lip-gloss-grape-wine',
      sku: 'LG-WN-0005',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Sultry grape wine gloss lacquer (Code: LG-WN-0005).',
      description: 'Deep plum grape wine shade with brilliant reflective shine.',
      image: '/products-image all/LipGloss_LG-WN-0005_Grape-Wine.jpg',
      color: 'Grape Wine',
      colorHex: '#581845',
      stock: 18,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Chocolate Brown',
      slug: 'vistora-glass-shine-lip-gloss-chocolate-brown',
      sku: 'LG-BR-0006',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Warm espresso chocolate brown gloss (Code: LG-BR-0006).',
      description: 'Earthy chocolate brown gloss with non-tacky comfortable oil base.',
      image: '/products-image all/LipGloss_LG-BR-0006_Brown.jpg',
      color: 'Brown',
      colorHex: '#4A2C11',
      stock: 20,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Orange',
      slug: 'vistora-glass-shine-lip-gloss-orange',
      sku: 'LG-OG-0004',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Juicy mandarin orange gloss lacquer (Code: LG-OG-0004).',
      description: 'Vibrant orange lip shine infused with nourishing botanical oils.',
      image: '/products-image all/LipGloss_LG-OG-0004_Orange.jpg',
      color: 'Orange',
      colorHex: '#FFA500',
      stock: 28,
    },
    {
      name: 'Vistora Glass Shine Lip Gloss - Ruby Red',
      slug: 'vistora-glass-shine-lip-gloss-ruby-red',
      sku: 'LG-RD-0001',
      categoryId: catLipGloss.id,
      brandId: brandVistoraLuxe.id,
      price: 399.00,
      compareAtPrice: 549.00,
      shortDescription: 'Classic ruby red lip gloss (Code: LG-RD-0001).',
      description: 'High-pigment glossy ruby red lacquer for bold statement shine.',
      image: '/products-image all/LipGloss_LG-RD-0001_Red.jpg',
      color: 'Red',
      colorHex: '#FF0000',
      stock: 40,
    },

    // ---------------- Kajals & Eyeliners (8) ----------------
    {
      name: 'Bbloom VNatura Ayurvedic Color Kajal Stick - Jet Black',
      slug: 'bbloom-vnatura-ayurvedic-color-kajal-stick-jet-black',
      sku: 'KJS-BK-0001',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 299.00,
      compareAtPrice: 399.00,
      shortDescription: 'Smudge-proof 100% natural Ayurvedic black kajal stick (Code: KJS-BK-0001).',
      description: 'Crafted with almond oil and camphor, soothing eyes while defining intense black waterlines.',
      image: '/products-image all/KajalStick_KJS-BK-0001_Black.jpg',
      color: 'Jet Black',
      colorHex: '#000000',
      stock: 50,
    },
    {
      name: 'Bbloom VNatura Ayurvedic Color Kajal Stick - Royal Blue',
      slug: 'bbloom-vnatura-ayurvedic-color-kajal-stick-royal-blue',
      sku: 'KJS-BL-0003',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 299.00,
      compareAtPrice: 399.00,
      shortDescription: 'Vibrant sapphire blue herbal kajal stick (Code: KJS-BL-0003).',
      description: 'Precision colored eye stick in electric royal blue with soothing natural herbs.',
      image: '/products-image all/KajalStick_KJS-BL-0003_Blue.jpg',
      color: 'Royal Blue',
      colorHex: '#4169E1',
      stock: 35,
    },
    {
      name: 'Bbloom VNatura 100% Natural Herbal Kajal Pot',
      slug: 'bbloom-vnatura-100-natural-herbal-kajal-pot',
      sku: 'KJ-ST-0001',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 349.00,
      compareAtPrice: 499.00,
      shortDescription: 'Traditional handcrafted eye kajal balm pot (Code: KJ-ST-0001).',
      description: 'Authentic 100% natural Ayurvedic soot kajal pot for holistic eye health and beauty.',
      image: '/products-image all/KajalPot_KJ-ST-0001_VNatura.jpg',
      color: 'Natural Black',
      colorHex: '#111111',
      stock: 45,
    },
    {
      name: 'Bbloom VNatura Ayurvedic Color Kajal Stick - Deep Brown',
      slug: 'bbloom-vnatura-ayurvedic-color-kajal-stick-deep-brown',
      sku: 'KJS-BR-0002',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 299.00,
      compareAtPrice: 399.00,
      shortDescription: 'Earthy chocolate brown precision kajal stick (Code: KJS-BR-0002).',
      description: 'Subtle brown eyeliner stick providing soft smoky eye definition naturally.',
      image: '/products-image all/KajalStick_KJS-BR-0002_Brown.jpg',
      color: 'Deep Brown',
      colorHex: '#5C4033',
      stock: 30,
    },
    {
      name: 'Bbloom VNatura Ayurvedic Color Kajal Stick - Emerald Green',
      slug: 'bbloom-vnatura-ayurvedic-color-kajal-stick-emerald-green',
      sku: 'KJS-GN-0004',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 299.00,
      compareAtPrice: 399.00,
      shortDescription: 'Stunning emerald green herbal kajal stick (Code: KJS-GN-0004).',
      description: 'Rich jewel-toned green kajal for dramatic eye liner definition.',
      image: '/products-image all/KajalStick_KJS-GN-0004_Green.jpg',
      color: 'Emerald Green',
      colorHex: '#50C878',
      stock: 25,
    },
    {
      name: 'Bbloom VNatura Ayurvedic Natural Kajal Collection Banner',
      slug: 'bbloom-vnatura-ayurvedic-natural-kajal-collection-banner',
      sku: 'KJ-BAN-0001',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 349.00,
      compareAtPrice: 499.00,
      shortDescription: 'Experience the soothing power of nature with Bbloom VNatura Kajal.',
      description: 'Herbal cooling kajal pot formulation enriched with pure castor oil and ghee.',
      image: '/products-image all/Kajal_Ayurvedic-Bbloom-VNatura-Banner.jpg',
      color: 'Black',
      colorHex: '#000000',
      stock: 60,
    },
    {
      name: 'Bbloom VNatura Herbal Precision Kajal Stick - Classic Matte Black',
      slug: 'bbloom-vnatura-herbal-precision-kajal-stick-classic-matte-black',
      sku: 'KJS-BK-0001-V',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 299.00,
      compareAtPrice: 399.00,
      shortDescription: 'Smooth glide waterproof matte black kajal stick.',
      description: 'Precision tip applicator for sharp winged liner and tightlining.',
      image: '/products-image all/KajalStick_KJS-BK-0001_Black-Variant.jpg',
      color: 'Matte Black',
      colorHex: '#0A0A0A',
      stock: 40,
    },
    {
      name: 'Bbloom VNatura 4-Color Ayurvedic Kajal Stick Variety Set',
      slug: 'bbloom-vnatura-4-color-ayurvedic-kajal-stick-variety-set',
      sku: 'KJS-SET-0004',
      categoryId: catKajal.id,
      brandId: brandBbloom.id,
      price: 999.00,
      compareAtPrice: 1299.00,
      shortDescription: 'Complete 4-shade herbal kajal stick bundle (Black, Blue, Green, Brown).',
      description: 'Get all 4 signature Ayurvedic color kajal sticks in one premium gift pack.',
      image: '/products-image all/KajalStick_Bbloom-VNatura-Set-Banner.jpg',
      color: '4 Color Set',
      colorHex: '#2E8B57',
      stock: 20,
    },

    // ---------------- Skincare (2) ----------------
    {
      name: 'Bbloom VNatura 100% Natural Under Eye Cream (15g)',
      slug: 'bbloom-vnatura-100-natural-under-eye-cream-15g',
      sku: 'UEC-BAN-0001',
      categoryId: catSkincare.id,
      brandId: brandBbloom.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: 'Dark circle corrector & puffiness treatment cream (15g).',
      description: 'Prevents dullness, corrects puffiness, clears dark circles and nourishes delicate under-eye skin.',
      image: '/products-image all/UnderEyeCream_Bbloom-VNatura-15g-Banner.jpg',
      color: 'Natural Cream',
      colorHex: '#FFF8DC',
      stock: 35,
    },
    {
      name: 'Bbloom VNatura Dark Circle Corrector Jar - 15g',
      slug: 'bbloom-vnatura-dark-circle-corrector-jar-15g',
      sku: 'UEC-ST-0001',
      categoryId: catSkincare.id,
      brandId: brandBbloom.id,
      price: 499.00,
      compareAtPrice: 699.00,
      shortDescription: '100% Natural handcrafted eye balm (Code: UEC-ST-0001).',
      description: 'Infused with cucumber extract and green tea antioxidants to revive tired eyes.',
      image: '/products-image all/UnderEyeCream_UEC-ST-0001.jpg',
      color: 'Natural Jar',
      colorHex: '#FFFFF0',
      stock: 40,
    },

    // ---------------- Sarees & Handloom (6) ----------------
    {
      name: 'MST Myil Khan Pet Traditional Saree Collection (Grid C2)',
      slug: 'mst-myil-khan-pet-traditional-saree-collection-grid-c2',
      sku: 'MST-MKP-C2',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 1899.00,
      compareAtPrice: 2499.00,
      shortDescription: '15 vibrant color combinations in traditional Myil Khan Pet border saree.',
      description: 'Handcrafted South Indian cotton saree with gold zari border, available in 15 distinct traditional shades.',
      image: '/products-image all/Saree_MST-Myil-Khan-Pet-C2.jpg',
      color: 'Multi Color Grid',
      colorHex: '#8B0000',
      stock: 15,
    },
    {
      name: 'MST Krishna Pet Artisanal Zari Saree Grid (C3)',
      slug: 'mst-krishna-pet-artisanal-zari-saree-grid-c3',
      sku: 'MST-KRP-C3',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 1999.00,
      compareAtPrice: 2699.00,
      shortDescription: '17 rich festive shades with temple zari borders (Krishna Pet C3).',
      description: 'Exclusive Krishna Pet handloom weave with intricate contrast borders and pallu.',
      image: '/products-image all/Saree_MST-Krishna-Pet-C3.jpg',
      color: 'Festive Shade Grid',
      colorHex: '#DAA520',
      stock: 18,
    },
    {
      name: 'MST C4 Traditional Border Dhoti & Saree Collection',
      slug: 'mst-c4-traditional-border-dhoti-saree-collection',
      sku: 'MST-C4-BRD',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 1499.00,
      compareAtPrice: 1999.00,
      shortDescription: 'Gold border dhoti and saree fabrics in 7 solid rich hues (C4).',
      description: 'Featuring Yellow, D.Kaavi, Mango, Orange, Red, Maroon, and pure White borders.',
      image: '/products-image all/Saree_MST-C4-Border-Collection.jpg',
      color: 'Solid Zari Border Grid',
      colorHex: '#FF8C00',
      stock: 22,
    },
    {
      name: 'MTS C1 Jakkad Peacock Zari Border Saree Set',
      slug: 'mts-c1-jakkad-peacock-zari-border-saree-set',
      sku: 'MTS-C1-JKD',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 2499.00,
      compareAtPrice: 3299.00,
      shortDescription: 'Jacquard woven peacock motif zari border saree collection (C1).',
      description: 'Heavy grand pallu sarees featuring opulent peacock jacquard weaving along the borders.',
      image: '/products-image all/Saree_MTS-C1-Jakkad.jpg',
      color: 'Jacquard Zari Grid',
      colorHex: '#006400',
      stock: 12,
    },
    {
      name: 'MST S1 Temple Zari Border Handloom Fabric Swatches',
      slug: 'mst-s1-temple-zari-border-handloom-fabric-swatches',
      sku: 'MST-S1-TMP',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 1699.00,
      compareAtPrice: 2199.00,
      shortDescription: 'Geometric temple pattern zari border handloom collection (S1).',
      description: 'Traditional temple (Gopuram) border design in 8 vibrant dual-tone cotton weaves.',
      image: '/products-image all/Saree_MST-S1-Temple-Border.jpg',
      color: 'Temple Border Grid',
      colorHex: '#4682B4',
      stock: 25,
    },
    {
      name: 'MST C5 Traditional Handloom Cotton Saree Grid (10 Colors)',
      slug: 'mst-c5-traditional-handloom-cotton-saree-grid-10-colors',
      sku: 'MST-C5-CTN',
      categoryId: catSarees.id,
      brandId: brandMST.id,
      price: 1599.00,
      compareAtPrice: 2099.00,
      shortDescription: 'Soft breathable 100% cotton handloom saree collection (C5).',
      description: 'Ideal for summer comfort and elegant everyday ethnic wear, featuring 10 colorful designs.',
      image: '/products-image all/Saree_MST-C5-Cotton-Collection.jpg',
      color: 'Cotton Weave Grid',
      colorHex: '#CD853F',
      stock: 30,
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

  console.log(`✅ Successfully seeded 40 real products!`);

  // 8. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      title: 'Welcome 10% Discount',
      description: 'Get 10% off on your first beauty & saree order',
      type: CouponType.PERCENTAGE,
      value: 10,
      minimumOrderAmount: 499,
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
  const addr1 = await prisma.address.findFirst({ where: { userId: customer1.id } });
  const sampleLipstick = await prisma.product.findFirst({ where: { slug: 'vistora-velvet-matte-lipstick-pink-red' } });
  const sampleSaree = await prisma.product.findFirst({ where: { slug: 'mst-myil-khan-pet-traditional-saree-collection-grid-c2' } });

  if (addr1 && sampleLipstick && sampleSaree) {
    const varLipstick = await prisma.productVariant.findFirst({ where: { productId: sampleLipstick.id } });
    const varSaree = await prisma.productVariant.findFirst({ where: { productId: sampleSaree.id } });

    await prisma.order.upsert({
      where: { orderNumber: 'ORD-2026-1001' },
      update: {},
      create: {
        orderNumber: 'ORD-2026-1001',
        userId: customer1.id,
        addressId: addr1.id,
        subtotal: 2398.00,
        discount: 200.00,
        tax: 219.80,
        shipping: 0.00,
        total: 2417.80,
        status: OrderStatus.DELIVERED,
        notes: 'Express packaging requested.',
        items: {
          create: [
            {
              productId: sampleLipstick.id,
              variantId: varLipstick?.id,
              productName: sampleLipstick.name,
              sku: sampleLipstick.sku,
              quantity: 1,
              unitPrice: 499.00,
              discount: 0.00,
              tax: 44.91,
              total: 499.00,
            },
            {
              productId: sampleSaree.id,
              variantId: varSaree?.id,
              productName: sampleSaree.name,
              sku: sampleSaree.sku,
              quantity: 1,
              unitPrice: 1899.00,
              discount: 200.00,
              tax: 174.89,
              total: 1699.00,
            },
          ],
        },
        payments: {
          create: [
            {
              paymentMethod: PaymentMethod.RAZORPAY,
              status: PaymentStatus.PAID,
              amount: 2417.80,
              transactionReference: 'pay_VistoraDemo1001',
              paidAt: new Date(),
            },
          ],
        },
      },
    });
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
