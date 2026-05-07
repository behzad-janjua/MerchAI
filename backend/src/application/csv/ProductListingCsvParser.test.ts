import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ProductListingCsvParser } from "./ProductListingCsvParser.js";

describe("ProductListingCsvParser", () => {
  const parser = new ProductListingCsvParser();

  it("imports Shopify export columns", () => {
    const result = parser.parse([
      "Handle,Title,Body (HTML),Vendor,Type,Tags,Variant Price,Variant Inventory Qty",
      "linen-tote,Linen Tote,<p>Durable everyday tote</p>,Merch Co,Bags,\"tote, linen, gift\",24.50,8"
    ].join("\n"));

    assert.equal(result.format, "shopify");
    assert.equal(result.errors.length, 0);
    assert.equal(result.rows[0].title, "Linen Tote");
    assert.equal(result.rows[0].handle, "linen-tote");
    assert.equal(result.rows[0].productType, "Bags");
    assert.deepEqual(result.rows[0].tags, ["tote", "linen", "gift"]);
    assert.equal(result.rows[0].price, 24.5);
    assert.equal(result.rows[0].inventoryQuantity, 8);
  });

  it("imports simple demo template columns", () => {
    const result = parser.parse([
      "title,description,tags,price,vendor,productType,handle",
      "Camp Mug,Enamel mug for weekend coffee,\"mug|camp|gift\",18,Merch Co,Drinkware,camp-mug"
    ].join("\n"));

    assert.equal(result.format, "simple");
    assert.equal(result.errors.length, 0);
    assert.equal(result.rows[0].title, "Camp Mug");
    assert.equal(result.rows[0].vendor, "Merch Co");
    assert.deepEqual(result.rows[0].tags, ["mug", "camp", "gift"]);
  });

  it("returns row-level validation errors", () => {
    const result = parser.parse([
      "title,description,tags,price",
      ",Missing title,gift,not-a-price"
    ].join("\n"));

    assert.equal(result.rows.length, 0);
    assert.equal(result.errors.length, 1);
    assert.equal(result.errors[0].row, 2);
    assert.match(result.errors[0].errors.join(" "), /title is required/);
    assert.match(result.errors[0].errors.join(" "), /price must be a valid number/);
  });
});
