-- CreateTable
CREATE TABLE "userproduct" (
    "userid" INTEGER NOT NULL,
    "productid" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "userproduct_userid_productid_key" ON "userproduct"("userid", "productid");

-- AddForeignKey
ALTER TABLE "userproduct" ADD CONSTRAINT "userproduct_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userproduct" ADD CONSTRAINT "userproduct_productid_fkey" FOREIGN KEY ("productid") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
