-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Percentage',
    "value" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "comparePrice" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT,
    "color" TEXT,
    "material" TEXT,
    "images" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "isKids" BOOLEAN NOT NULL DEFAULT false,
    "showOnWebsite" BOOLEAN NOT NULL DEFAULT true,
    "attributes" JSONB,
    "discountPrice" REAL,
    "saleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("attributes", "categoryId", "color", "comparePrice", "costPrice", "createdAt", "description", "featured", "id", "images", "isKids", "isNewArrival", "material", "name", "price", "showOnWebsite", "size", "sku", "stock", "updatedAt") SELECT "attributes", "categoryId", "color", "comparePrice", "costPrice", "createdAt", "description", "featured", "id", "images", "isKids", "isNewArrival", "material", "name", "price", "showOnWebsite", "size", "sku", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
