import { AccountStatus, AddressType, AuthProvider, CategoryStatus, CouponStatus, CouponType, OrderStatus, PaymentMethod, PaymentStatus, ProductStatus, ProductVisibility, ReviewStatus, ShipmentStatus, PrismaClient, UserRole } from '@prisma/client';
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
    { firstName: 'Marcus', lastName: 'Aurelius', email: 'marcus.aurelius@example.com', phone: '+91 98765 43213', status: AccountStatus.SUSPENDED },
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

    // Address
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

  // 4. Seed Categories & Brands
  console.log('📁 Seeding Categories & Brands...');
  const menCat = await prisma.category.upsert({
    where: { slug: 'men' },
    update: {},
    create: { name: 'Men', slug: 'men', description: 'Men fashion apparel', status: CategoryStatus.ACTIVE },
  });

  const womenCat = await prisma.category.upsert({
    where: { slug: 'women' },
    update: {},
    create: { name: 'Women', slug: 'women', description: 'Women haute couture', status: CategoryStatus.ACTIVE },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: 'vistora-studio' },
    update: {},
    create: { name: 'Vistora Studio', slug: 'vistora-studio', description: 'In-house couture' },
  });

  // 5. Seed Sample Products
  console.log('👗 Seeding Products & High Fashion Variants...');
  const product1 = await prisma.product.upsert({
    where: { slug: 'silk-evening-gown' },
    update: {},
    create: {
      name: 'Double-Breasted Wool Trench Coat',
      slug: 'silk-evening-gown',
      sku: 'VSTR-DRS-001',
      shortDescription: 'An editorial-worthy double-breasted trench coat tailored from a premium wool blend.',
      description: 'Featuring structured shoulders, storm flaps, and a removable waist belt for a sophisticated silhouette. Cut on the bias for a fluid, figure-skimming fit, this silk velvet gown exudes modern minimalism.',
      price: 349.00,
      compareAtPrice: 420.00,
      featured: true,
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.PUBLIC,
      categoryId: womenCat.id,
      brandId: brand.id,
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1 },
          { imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80', isPrimary: false, sortOrder: 2 },
          { imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80', isPrimary: false, sortOrder: 3 },
        ],
      },
      variants: {
        create: [
          { sku: 'VSTR-DRS-001-CAMEL-S', color: 'Camel', colorHex: '#C19A6B', size: 'S', price: 349.00, stock: 12 },
          { sku: 'VSTR-DRS-001-CAMEL-M', color: 'Camel', colorHex: '#C19A6B', size: 'M', price: 349.00, stock: 18 },
          { sku: 'VSTR-DRS-001-BLACK-S', color: 'Black', colorHex: '#1A1A1A', size: 'S', price: 349.00, stock: 8 },
          { sku: 'VSTR-DRS-001-RED-M', color: 'Crimson Red', colorHex: '#9E1B1B', size: 'M', price: 349.00, stock: 15 },
        ],
      },
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'tailored-cashmere-blazer' },
    update: {},
    create: {
      name: 'Tailored Cashmere Italian Blazer',
      slug: 'tailored-cashmere-blazer',
      sku: 'VSTR-BLZ-002',
      shortDescription: 'Double-breasted Italian cashmere blazer in midnight navy and beige.',
      description: 'An indispensable basic for the refined wardrobe. Knitted from ultra-soft, ethically sourced cashmere with lapel collars.',
      price: 220.00,
      compareAtPrice: 280.00,
      featured: true,
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.PUBLIC,
      categoryId: menCat.id,
      brandId: brand.id,
      images: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80', isPrimary: true, sortOrder: 1 },
          { imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80', isPrimary: false, sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          { sku: 'VSTR-BLZ-002-NAVY-M', color: 'Midnight Navy', colorHex: '#0A192F', size: 'M', price: 220.00, stock: 10 },
          { sku: 'VSTR-BLZ-002-NAVY-L', color: 'Midnight Navy', colorHex: '#0A192F', size: 'L', price: 220.00, stock: 14 },
          { sku: 'VSTR-BLZ-002-BEIGE-M', color: 'Beige', colorHex: '#D2B48C', size: 'M', price: 220.00, stock: 7 },
        ],
      },
    },
  });

  // 6. Seed Coupons
  console.log('🎟️ Seeding Coupons...');
  const coupon1 = await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      title: 'Welcome 10% Discount',
      description: 'Get 10% off on your first order',
      type: CouponType.PERCENTAGE,
      value: 10,
      minimumOrderAmount: 5000,
      maximumDiscount: 2000,
      usageLimit: 500,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: CouponStatus.ACTIVE,
    },
  });

  const coupon2 = await prisma.coupon.upsert({
    where: { code: 'FLAT2000' },
    update: {},
    create: {
      code: 'FLAT2000',
      title: 'Flat ₹2,000 Off Luxury Line',
      description: 'Flat ₹2000 discount on cart value above ₹15,000',
      type: CouponType.FIXED_AMOUNT,
      value: 2000,
      minimumOrderAmount: 15000,
      usageLimit: 100,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: CouponStatus.ACTIVE,
    },
  });

  // 7. Seed Orders & Invoices
  console.log('🛒 Seeding Orders & Order Details...');
  const customer1 = createdCustomers[0];
  const addr1 = await prisma.address.findFirst({ where: { userId: customer1.id } });

  if (addr1) {
    const order1 = await prisma.order.upsert({
      where: { orderNumber: 'ORD-2026-1001' },
      update: {},
      create: {
        orderNumber: 'ORD-2026-1001',
        userId: customer1.id,
        addressId: addr1.id,
        subtotal: 24999.00,
        discount: 2000.00,
        tax: 4139.82,
        shipping: 0.00,
        total: 27138.82,
        status: OrderStatus.DELIVERED,
        notes: 'Priority white-glove packaging requested.',
        items: {
          create: [
            {
              productId: product1.id,
              productName: product1.name,
              sku: product1.sku,
              quantity: 1,
              unitPrice: 24999.00,
              discount: 2000.00,
              tax: 4139.82,
              total: 27138.82,
            },
          ],
        },
        payments: {
          create: [
            {
              paymentMethod: PaymentMethod.RAZORPAY,
              status: PaymentStatus.PAID,
              gatewayPaymentId: 'pay_Lzk83749281',
              amount: 27138.82,
              transactionReference: 'TXN-99882211',
              paidAt: new Date(),
            },
          ],
        },
        shipment: {
          create: {
            courierName: 'BlueDart Express',
            trackingNumber: 'BD-884920194',
            shipmentStatus: ShipmentStatus.DELIVERED,
            shippedAt: new Date(Date.now() - 86400000 * 2),
            deliveredAt: new Date(),
          },
        },
        invoice: {
          create: {
            invoiceNumber: 'INV-2026-1001',
            status: 'SENT',
          },
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, remarks: 'Order placed by customer', updatedBy: customer1.fullName },
            { status: OrderStatus.CONFIRMED, remarks: 'Payment verified', updatedBy: 'System Auto' },
            { status: OrderStatus.SHIPPED, remarks: 'Dispatched via BlueDart', updatedBy: 'Warehouse Manager' },
            { status: OrderStatus.DELIVERED, remarks: 'Delivered and signed', updatedBy: 'Courier API' },
          ],
        },
      },
    });

    await prisma.couponUsage.upsert({
      where: { couponId_orderId: { couponId: coupon2.id, orderId: order1.id } },
      update: {},
      create: {
        couponId: coupon2.id,
        userId: customer1.id,
        orderId: order1.id,
        discount: 2000.00,
      },
    });

    // 8. Seed Reviews
    console.log('⭐ Seeding Product Reviews...');
    await prisma.review.createMany({
      data: [
        {
          productId: product1.id,
          userId: customer1.id,
          orderId: order1.id,
          rating: 5,
          title: 'Exquisite Quality & Perfect Fit',
          comment: 'The silk velvet fabric feels divine. The stitching is immaculate and it arrived in a luxury velvet dust bag.',
          status: ReviewStatus.APPROVED,
        },
        {
          productId: product2.id,
          userId: createdCustomers[1].id,
          rating: 4,
          title: 'Great Blazer, Sleek Tailoring',
          comment: 'Fits comfortably across the shoulders. Excellent Italian cashmere texture.',
          status: ReviewStatus.PENDING,
        },
      ],
      skipDuplicates: true,
    });
  }

  // 9. Seed Banners
  console.log('🖼️ Seeding Hero Banners...');
  const banners = [
    {
      title: 'Haute Couture Autumn Collection 2026',
      subtitle: 'Discover hand-crafted Italian silk gowns and cashmere outerwear.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
      mobileImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
      position: 'HERO_SLIDER',
      buttonText: 'Explore Collection',
      buttonLink: '/shop?collection=autumn-2026',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'Monochrome Tailored Suits',
      subtitle: 'Bespoke tailoring engineered for timeless elegance.',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop',
      mobileImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
      position: 'HERO_SLIDER',
      buttonText: 'Shop Tailoring',
      buttonLink: '/shop?category=men',
      sortOrder: 2,
      isActive: true,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({
      data: b,
    });
  }

  // 10. Seed Default CMS Pages
  console.log('📄 Seeding Default CMS Pages...');
  const cmsPages = [
    {
      title: 'About Us',
      slug: 'about-us',
      content: `<h2>About Vistora Commerce</h2><p>Vistora Commerce is an elite single-vendor luxury fashion house offering handcrafted haute couture, luxury outerwear, and bespoke artisanal garments.</p>`,
      metaTitle: 'About Us | Vistora Commerce Luxury Fashion',
      metaDescription: 'Learn about Vistora Commerce, our heritage, craftsmanship, and luxury fashion philosophy.',
      metaKeywords: 'about us, luxury fashion, haute couture, vistora commerce',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      content: `<h2>Contact Customer Concierge</h2><p>Have questions about your order, custom sizing, or private styling appointments? Get in touch with our private concierge team.</p><p>Email: concierge@vistoracommerce.com<br>Phone: +91 1800 200 9000</p>`,
      metaTitle: 'Contact Us | Customer Concierge',
      metaDescription: 'Reach out to Vistora Commerce customer concierge for assistance with orders and private appointments.',
      metaKeywords: 'contact us, customer service, concierge, support',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `<h2>Privacy Policy</h2><p>Your privacy is paramount to Vistora Commerce. We protect your personal data with enterprise-grade encryption and strict privacy standards.</p>`,
      metaTitle: 'Privacy Policy | Vistora Commerce',
      metaDescription: 'Read the privacy policy and data protection practices of Vistora Commerce.',
      metaKeywords: 'privacy policy, data protection, privacy',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-and-conditions',
      content: `<h2>Terms & Conditions</h2><p>Welcome to Vistora Commerce. By accessing our platform, you agree to comply with our store terms and purchasing guidelines.</p>`,
      metaTitle: 'Terms & Conditions | Vistora Commerce',
      metaDescription: 'Official terms and conditions for shopping at Vistora Commerce.',
      metaKeywords: 'terms, conditions, legal',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Refund Policy',
      slug: 'refund-policy',
      content: `<h2>Refund & Return Policy</h2><p>We offer a hassle-free 14-day return and refund window for undamaged luxury items returned in original packaging with intact security seals.</p>`,
      metaTitle: 'Refund & Return Policy | Vistora Commerce',
      metaDescription: 'Learn about our 14-day return, exchange, and refund policy.',
      metaKeywords: 'refund policy, returns, exchanges',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      content: `<h2>Shipping & Delivery Policy</h2><p>Vistora Commerce offers complimentary insured white-glove express delivery across India for orders exceeding ₹10,000.</p>`,
      metaTitle: 'Shipping & Delivery Policy | Vistora Commerce',
      metaDescription: 'Insured express shipping details, delivery timelines, and courier partners.',
      metaKeywords: 'shipping policy, delivery, bluedart',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'FAQ',
      slug: 'faq',
      content: `<h2>Frequently Asked Questions</h2><h3>Q1: Are all garments authentic?</h3><p>Yes, all items are designed, manufactured, and certified in-house by Vistora Studio.</p>`,
      metaTitle: 'Frequently Asked Questions (FAQ) | Vistora Commerce',
      metaDescription: 'Find answers to common questions regarding sizing, payments, shipping, and returns.',
      metaKeywords: 'faq, questions, help, support',
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
  ];

  for (const page of cmsPages) {
    await prisma.cMSPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        status: page.status,
      },
      create: page,
    });
  }

  // 11. Seed Settings
  const settings = [
    { key: 'site_name', value: 'Vistora Commerce', description: 'Official store name' },
    { key: 'store_currency', value: 'INR', description: 'Primary operating currency' },
    { key: 'support_email', value: 'support@vistoracommerce.com', description: 'Customer support email' },
    { key: 'tax_rate_percent', value: '18.00', description: 'Standard GST/Tax percentage rate' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }

  console.log('🎉 Vistora Commerce Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
