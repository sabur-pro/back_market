import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@market.com' },
    update: {},
    create: {
      email: 'admin@market.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@market.com' },
    update: {},
    create: {
      email: 'user@market.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  });
  console.log('Created user:', user.email);

  // корзины для пользователей
  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  console.log('Created carts');

  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Новейший смартфон от Apple с процессором A17 Pro',
      price: 89990,
      costPrice: 60000,
      imageUrl: 'https://www.mobileana.com/wp-content/uploads/2025/06/Apple-iPhone-17-Pro-Max-Cosmic-Orange.webp',
      category: 'Смартфоны',
      stock: 25,
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Флагманский смартфон Samsung с AI функциями',
      price: 79990,
      costPrice: 52000,
      imageUrl: 'https://img-prd-pim.poorvika.com/cdn-cgi/image/width=500,height=500,quality=75/product/Samsung-galaxy-s24-5g-onyx-black-256gb-8gb-ram-Front-Back-View.png',
      category: 'Смартфоны',
      stock: 30,
    },
    {
      name: 'MacBook Pro 16',
      description: 'Мощный ноутбук для профессионалов с M3 Pro',
      price: 199990,
      costPrice: 140000,
      imageUrl: 'https://sm.pcmag.com/pcmag_me/review/a/apple-macb/apple-macbook-pro-16-inch-2023-m3-max_cah1.jpg',
      category: 'Ноутбуки',
      stock: 15,
    },
    {
      name: 'Dell XPS 15',
      description: 'Премиальный ноутбук с OLED экраном',
      price: 149990,
      costPrice: 100000,
      imageUrl: 'https://sm.pcmag.com/t/pcmag_uk/review/d/dell-xps-1/dell-xps-15-9530-2023_uxjn.1200.jpg',
      category: 'Ноутбуки',
      stock: 20,
    },
    {
      name: 'AirPods Pro 2',
      description: 'Беспроводные наушники с активным шумоподавлением',
      price: 19990,
      costPrice: 12000,
      imageUrl: 'https://apple-market.ru/image/cache/catalog/Add/airpods%20pro%202/airpods2pro5.jpg_500.webp',
      category: 'Аксессуары',
      stock: 50,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Топовые накладные наушники с шумоподавлением',
      price: 29990,
      costPrice: 18000,
      imageUrl: 'https://metapod.com/cdn/shop/files/sony-wh-1000xm5-noise-cancelling-wireless-headphones-34338795192516.jpg?v=1754022978&width=1500',
      category: 'Аксессуары',
      stock: 35,
    },
    {
      name: 'iPad Air',
      description: 'Планшет Apple с M1 чипом',
      price: 59990,
      costPrice: 40000,
      imageUrl: 'https://static0.pocketlintimages.com/wordpress/wp-content/uploads/wm/154323-tablets-review-ipad-air-review-image11-suzskyf9ic.jpg',
      category: 'Планшеты',
      stock: 40,
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Умные часы с новым процессором',
      price: 39990,
      costPrice: 25000,
      imageUrl: 'https://media.wired.com/photos/650a2f13442bf6b5518458c7/master/pass/Apple-Watch-Series-9-Review-Featured-Gear.jpg',
      category: 'Аксессуары',
      stock: 45,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }
  console.log('Created products');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

