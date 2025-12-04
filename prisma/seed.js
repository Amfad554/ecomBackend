const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const productsData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../ecommerce/ecommerce/data/data.json'),
    'utf-8'
  )
);

async function main() {
  console.log('Starting seed...');

  const categories = ['men', 'women', 'children'];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    console.log(`Category created/updated: ${categoryName}`);
  }

  const menCategory = await prisma.category.findUnique({ where: { name: 'men' } });
  const womenCategory = await prisma.category.findUnique({ where: { name: 'women' } });
  const childrenCategory = await prisma.category.findUnique({ where: { name: 'children' } });

  const categoryMap = {
    men: menCategory.id,
    women: womenCategory.id,
    children: childrenCategory.id,
  };

  console.log('Adding products...');
  let successCount = 0;

  for (const product of productsData.products) {
    const categoryId = categoryMap[product.category];
    if (!categoryId) continue;

    const existingProduct = await prisma.product.findFirst({ where: { name: product.name } });
    if (existingProduct) continue;

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        sizes: product.sizes,
        defaultSize: product.defaultSize,
        colors: product.colors,
        defaultColor: product.defaultColor,
        bestSeller: product.bestSeller,
        newArrival: product.newArrival || false,
        image: product.image,
        subcategory: product.subcategory,
        rating: product.rating,
        discount: product.discount,
        tags: product.tags,
        categoryId: categoryId,
      },
    });

    successCount++;
    console.log(`Added product: ${product.name}`);
  }

  console.log('Seeding complete!');
  console.log(`Successfully added: ${successCount} products`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
