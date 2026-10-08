import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const BACKUP_FILE = path.join(__dirname, 'price-backup.json');

async function main() {
  let originalPrice = 242.0;
  let targetSku = 'FLR-UKM-024-500G';
  let targetProductId = 'cmuv1rvin006tdjeggk88yey9';
  let targetVariantId = 'cmuv1rvin006xdjeg19c4d3h8';

  if (fs.existsSync(BACKUP_FILE)) {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
    const data = JSON.parse(raw);
    originalPrice = data.variantOriginalPrice || data.productOriginalPrice || 242.0;
    targetSku = data.variantSku || targetSku;
    targetProductId = data.productId || targetProductId;
    targetVariantId = data.variantId || targetVariantId;
  }

  console.log(`Reverting ${targetSku} to Rs. ${originalPrice}...`);

  await prisma.product.update({
    where: { id: targetProductId },
    data: { price: originalPrice },
  });

  await prisma.productVariant.update({
    where: { id: targetVariantId },
    data: { price: originalPrice },
  });

  const cartItems = await prisma.cartItem.findMany({
    where: {
      OR: [
        { variantId: targetVariantId },
        { productId: targetProductId }
      ]
    },
    include: { cart: true }
  });

  for (const item of cartItems) {
    const newUnitPrice = originalPrice;
    const newTotalPrice = newUnitPrice * item.quantity;
    await prisma.cartItem.update({
      where: { id: item.id },
      data: {
        unitPrice: newUnitPrice,
        totalPrice: newTotalPrice,
      }
    });

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

  console.log(`✅ Successfully reverted product and variant price to Rs. ${originalPrice}`);
}

main()
  .catch((e) => {
    console.error('Error reverting price:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
