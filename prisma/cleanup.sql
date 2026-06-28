DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT id FROM "Product");
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT id FROM "Product");
