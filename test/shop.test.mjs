import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build } from "../src/build.mjs";
import { fit, listings } from "../src/annonces.mjs";

const products = JSON.parse(fs.readFileSync(new URL("../products.json", import.meta.url), "utf8"));

test("fit coupe au mot entier sous la limite", () => {
  assert.equal(fit("un deux trois", 50), "un deux trois");
  assert.equal(fit("un deux trois quatre", 10), "un deux");
});

test("les annonces respectent les limites des plateformes", () => {
  for (const p of products) {
    const l = listings(p);
    assert.ok(l.ebay.titre.length <= 80, `eBay ${p.slug}`);
    assert.ok(l.amazon.titre.length <= 200, `Amazon ${p.slug}`);
    assert.ok(l.amazon.puces.length <= 5 && l.amazon.puces.every((b) => b.length <= 250));
    assert.ok(l.marketplace.titre.length <= 70);
  }
});

test("le build produit les pages produit, les pages légales, le flux Google et le JSON-LD", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "shop-"));
  const stats = build({ out });
  assert.equal(stats.products, products.length);
  for (const p of products) {
    const html = fs.readFileSync(path.join(out, "produit", p.slug, "index.html"), "utf8");
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const product = ld.find((d) => d["@type"] === "Product");
    assert.equal(product.offers.price, p.price.toFixed(2));
    assert.match(html, /<h1>/);
  }
  for (const page of ["cgv", "mentions-legales", "livraison-retours", "confidentialite"]) assert.ok(fs.existsSync(path.join(out, page, "index.html")), page);
  const feed = fs.readFileSync(path.join(out, "feed.xml"), "utf8");
  assert.equal((feed.match(/<item>/g) ?? []).length, products.length);
});

test("sans lien de paiement, le bouton est désactivé (pas de vente sans stock)", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "shop-"));
  build({ out });
  const html = fs.readFileSync(path.join(out, "produit", products[0].slug, "index.html"), "utf8");
  assert.match(html, /Bientôt disponible/);
});
