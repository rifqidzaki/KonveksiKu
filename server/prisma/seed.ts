import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Kaos Polos',
        category: 'kaos',
        availableMaterials: ['Cotton Combed 20s', 'Cotton Combed 24s', 'Cotton Combed 30s', 'Cotton Bamboo'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        availableColors: ['#FFFFFF', '#000000', '#1a1a2e', '#e94560', '#0f3460', '#16213e', '#533483', '#2b2d42', '#FF6B35', '#2d6a4f', '#fca311'],
        basePrice: 45000,
        imageUrl: null,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Polo Shirt',
        category: 'polo',
        availableMaterials: ['Lacoste Cotton', 'Lacoste PE', 'CVC Polo'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: ['#FFFFFF', '#000000', '#1a1a2e', '#0f3460', '#2b2d42'],
        basePrice: 75000,
        imageUrl: null,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hoodie',
        category: 'hoodie',
        availableMaterials: ['Fleece Cotton', 'Baby Terry', 'French Terry'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: ['#000000', '#1a1a2e', '#2b2d42', '#FFFFFF', '#533483'],
        basePrice: 120000,
        imageUrl: null,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jaket Bomber',
        category: 'jaket',
        availableMaterials: ['Parasut Despo', 'Taslan', 'Drill'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: ['#000000', '#1a1a2e', '#0f3460', '#2b2d42'],
        basePrice: 150000,
        imageUrl: null,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create demo vendor user
  const salt = await bcrypt.genSalt(10);
  const vendorUser = await prisma.user.create({
    data: {
      name: 'Konveksi Bandung Jaya',
      email: 'vendor@konveksiku.com',
      passwordHash: await bcrypt.hash('vendor123', salt),
      role: 'VENDOR',
      phone: '081234567890',
      address: 'Jl. Cihampelas No. 45, Bandung',
    },
  });

  await prisma.vendor.create({
    data: {
      userId: vendorUser.id,
      businessName: 'Konveksi Bandung Jaya',
      description: 'Konveksi terpercaya sejak 2015 di Bandung. Spesialis kaos, polo, dan hoodie custom dengan kualitas terbaik dan harga kompetitif.',
      location: 'Bandung, Jawa Barat',
      specialization: ['kaos', 'polo', 'hoodie'],
      rating: 4.8,
      totalReviews: 127,
      portfolio: {
        images: [],
        description: 'Portfolio konveksi kami mencakup berbagai proyek dari brand lokal, komunitas, dan perusahaan.',
      },
      isVerified: true,
      minOrderQty: 12,
    },
  });

  // Create second vendor
  const vendorUser2 = await prisma.user.create({
    data: {
      name: 'CV Maju Textile',
      email: 'vendor2@konveksiku.com',
      passwordHash: await bcrypt.hash('vendor123', salt),
      role: 'VENDOR',
      phone: '081298765432',
      address: 'Jl. Solo Raya No. 12, Solo',
    },
  });

  await prisma.vendor.create({
    data: {
      userId: vendorUser2.id,
      businessName: 'CV Maju Textile',
      description: 'Produsen garmen berkualitas tinggi di Solo. Melayani pesanan satuan hingga ribuan pcs dengan kecepatan produksi terbaik.',
      location: 'Solo, Jawa Tengah',
      specialization: ['kaos', 'jaket', 'seragam'],
      rating: 4.5,
      totalReviews: 89,
      portfolio: {
        images: [],
        description: 'Sudah melayani lebih dari 500 brand lokal dan nasional.',
      },
      isVerified: true,
      minOrderQty: 24,
    },
  });

  // Create third vendor
  const vendorUser3 = await prisma.user.create({
    data: {
      name: 'Garment Surabaya Prima',
      email: 'vendor3@konveksiku.com',
      passwordHash: await bcrypt.hash('vendor123', salt),
      role: 'VENDOR',
      phone: '081377788899',
      address: 'Jl. Rungkut Industri No. 8, Surabaya',
    },
  });

  await prisma.vendor.create({
    data: {
      userId: vendorUser3.id,
      businessName: 'Garment Surabaya Prima',
      description: 'Konveksi modern dengan mesin terbaru. Spesialis hoodie dan jaket bomber premium dengan finishing rapi.',
      location: 'Surabaya, Jawa Timur',
      specialization: ['hoodie', 'jaket', 'sweater'],
      rating: 4.6,
      totalReviews: 64,
      portfolio: {
        images: [],
        description: 'Fokus pada produk outerwear berkualitas premium.',
      },
      isVerified: true,
      minOrderQty: 12,
    },
  });

  // Create demo regular user
  await prisma.user.create({
    data: {
      name: 'User Demo',
      email: 'user@konveksiku.com',
      passwordHash: await bcrypt.hash('user123', salt),
      role: 'USER',
      phone: '089988776655',
      address: 'Jl. Sudirman No. 100, Jakarta',
    },
  });

  console.log('✅ Created demo vendors and user');
  console.log('');
  console.log('📋 Demo accounts:');
  console.log('   User:   user@konveksiku.com / user123');
  console.log('   Vendor: vendor@konveksiku.com / vendor123');
  console.log('');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
