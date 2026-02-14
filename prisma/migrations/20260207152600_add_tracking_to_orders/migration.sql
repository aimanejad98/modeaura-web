-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'Product',
    "fields" TEXT NOT NULL DEFAULT 'size,color,material',
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Staff',
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Clocked Out',
    "address" TEXT,
    "sin" TEXT,
    "dob" TEXT,
    "bankName" TEXT,
    "transitNumber" TEXT,
    "institutionNumber" TEXT,
    "accountNumber" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "totalHours" REAL NOT NULL DEFAULT 0,
    "staffId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "customer" TEXT NOT NULL DEFAULT 'Guest',
    "customerId" TEXT,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "payment" TEXT NOT NULL DEFAULT 'Unpaid',
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash',
    "amountPaid" REAL,
    "change" REAL,
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "date" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "shippingMethod" TEXT DEFAULT 'Standard',
    "discountAmount" REAL DEFAULT 0,
    "discountCode" TEXT,
    "trackingNumber" TEXT,
    "courier" TEXT,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Percentage',
    "value" REAL NOT NULL,
    "minOrderAmount" REAL NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1B2936',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FAF9F6',
    "accentColor" TEXT NOT NULL DEFAULT '#C9A227',
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "announcement" TEXT,
    "customCss" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "auraColor" TEXT,
    "fontFamily" TEXT,
    "visualArt" TEXT
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "lastModified" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "categoryId" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'Monthly',
    "nextDueDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Customer',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "totalSpend" REAL NOT NULL DEFAULT 0,
    "lastVisit" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SkuCounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeName" TEXT NOT NULL DEFAULT 'Mode AURA',
    "tagline" TEXT,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "website" TEXT,
    "taxRate" REAL NOT NULL DEFAULT 13,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "receiptNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "favicon" TEXT,
    "seoDescription" TEXT,
    "seoTitle" TEXT,
    "announcement" TEXT DEFAULT 'Complimentary Shipping on Orders Above $250'
);

-- CreateTable
CREATE TABLE "NavItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    CONSTRAINT "Material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "location" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT
);

-- CreateTable
CREATE TABLE "BusinessAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Equipment',
    "value" REAL NOT NULL,
    "dateAcquired" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Color" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hex" TEXT,
    "categoryId" TEXT,
    CONSTRAINT "Color_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_parentId_key" ON "Category"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SkuCounter_prefix_key" ON "SkuCounter"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");
