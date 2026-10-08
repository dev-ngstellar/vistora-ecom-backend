import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const BACKUP_FILE = path.join(__dirname, 'price-backup.json');

async function main() {
  const targetSku = 'FLR-UKM-024-500G';
  const targetProductName = 'Traditional Ulundhang Kanji Maavu';

  const variant = await prisma.productVariant.findUnique({
    where: { sku: targetSku },
    include: { product: true },
  });

  if (!variant) {
    throw new Error(`Variant with SKU ${targetSku} not found`);
  }

  const product = variant.product;

  const backupData = {
    productId: product.id,
    productName: product.name,
    productOriginalPrice: Number(product.price),
    variantId: variant.id,
    variantSku: variant.sku,
    variantOriginalPrice: Number(variant.price),
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log('Backed up original prices to', BACKUP_FILE, backupData);

  // Update product and variant to 1.00
  await prisma.product.update({
    where: { id: product.id },
    data: { price: 1.0 },
  });

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: { price: 1.0 },
  });

  // Update existing cart items
  const cartItems = await prisma.cartItem.findMany({
    where: {
      OR: [
        { variantId: variant.id },
        { productId: product.id }
      ]
    },
    include: { cart: true }
  });

  for (const item of cartItems) {
    const newUnitPrice = 1.0;
    const newTotalPrice = newUnitPrice * item.quantity;
    await prisma.cartItem.update({
      where: { id: item.id },
      data: {
        unitPrice: newUnitPrice,
        totalPrice: newTotalPrice,
      }
    });

    // Recalculate cart totals
    const allCartItems = await prisma.cartItem.findMany({
      where: { cartId: item.cartId }
    });
    const subtotal = allCartItems.reduce((acc, ci) => {
      const p = ci.id === item.id ? newTotalPrice : Number(ci.totalPrice);
      return acc + p;
    }, 0);

    const discount = Number(item.cart.discount) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Number((taxable * 0.08).toFixed(2));
    const shipping = subtotal >= 150 ? 0 : 15.0;
    const total = Number((taxable + tax + (subtotal > 0 ? shipping : 0)).toFixed(2));

    await prisma.cart.update({
      where: { id: item.cartId },
      data: {
        subtotal,
        tax,
        shipping: subtotal > 0 ? shipping : 0,
        total,
      }
    });
  }

  console.log('✅ Successfully updated product and variant price to Rs. 1.00');
}

main()
  .catch((e) => {
    console.error('Error setting test price:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
