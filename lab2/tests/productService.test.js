const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { createProduct, getAvailableProducts, discontinue } = require('../services/productService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('createProduct', () => {

  test('happy path — product is created with correct name, slug, and inStock default', async () => {
    const product = await createProduct({
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      price: 29.99,
    });

    expect(product.name).toBe('Wireless Mouse');
    expect(product.slug).toBe('wireless-mouse');
    expect(product.price).toBe(29.99);
    expect(product.inStock).toBe(true);
  });

  test('duplicate slug throws "Slug already in use"', async () => {
    await createProduct({
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      price: 29.99,
    });

    await expect(
      createProduct({ name: 'Another Mouse', slug: 'wireless-mouse', price: 19.99 })
    ).rejects.toThrow('Slug already in use');
  });

  test('negative price is rejected by Mongoose validation', async () => {
    await expect(
      createProduct({ name: 'Bad Product', slug: 'bad-product', price: -5 })
    ).rejects.toThrow();
  });

});

describe('getAvailableProducts', () => {

  test('returns only products where inStock is true', async () => {
    await Product.create([
      { name: 'Product A', slug: 'product-a', price: 10, inStock: true },
      { name: 'Product B', slug: 'product-b', price: 20, inStock: false },
      { name: 'Product C', slug: 'product-c', price: 30, inStock: true },
    ]);

    const available = await getAvailableProducts();

    expect(available).toHaveLength(2);
    expect(available.map(p => p.slug)).toEqual(
      expect.arrayContaining(['product-a', 'product-c'])
    );
    expect(available.map(p => p.slug)).not.toContain('product-b');
  });

});

// BONUS
describe('discontinue', () => {

  test('sets inStock to false and returns the updated product', async () => {
    await Product.create({ name: 'Keyboard', slug: 'keyboard', price: 49.99, inStock: true });

    const updated = await discontinue('keyboard');

    expect(updated.inStock).toBe(false);
    expect(updated.slug).toBe('keyboard');
  });

  test('throws "Product not found" for an unknown slug', async () => {
    await expect(discontinue('nonexistent-slug'))
      .rejects.toThrow('Product not found');
  });

});
