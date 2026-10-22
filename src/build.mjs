// Construit la boutique statique dans dist/ à partir de products.json et shop.config.json.
// Usage : npm run build
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const jsonLd = (d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`;
export const euro = (n) => n.toLocaleString("fr-BE", { style: "currency", currency: "EUR" });

// Visuels de secours tant que les vraies photos produit (src/img/<slug>-1.webp) n'existent pas.
const ICONS = {
  lid: `<ellipse cx="60" cy="74" rx="40" ry="12" fill="currentColor" opacity=".18"/><path d="M22 70c0-16 17-28 38-28s38 12 38 28" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><ellipse cx="60" cy="70" rx="38" ry="9" fill="currentColor" opacity=".45"/><circle cx="60" cy="40" r="5" fill="currentColor"/>`,
  bag: `<rect x="30" y="26" width="60" height="70" rx="12" fill="currentColor" opacity=".25"/><rect x="30" y="26" width="60" height="70" rx="12" fill="none" stroke="currentColor" stroke-width="6"/><path d="M30 42h60" stroke="currentColor" stroke-width="6"/><path d="M44 64c8 6 24 6 32 0" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
  kit: `<rect x="18" y="44" width="52" height="54" rx="10" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="5"/><path d="M18 58h52" stroke="currentColor" stroke-width="5"/><ellipse cx="80" cy="46" rx="26" ry="8" fill="currentColor" opacity=".45"/><path d="M54 46c0-12 12-20 26-20s26 8 26 20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
};

function visual(p, images, { eager = false, n = 1 } = {}) {
  const file = `${p.slug}-${n}`;
  if (images.has(file))
    return `<img class="pimg" src="/img/${file}.webp" width="900" height="900" alt="${esc(p.name)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  return `<div class="pimg pimg-fallback" style="--accent:${p.accent}" role="img" aria-label="${esc(p.name)}"><svg viewBox="0 0 120 120" width="55%" aria-hidden="true">${ICONS[p.icon] ?? ICONS.kit}</svg></div>`;
}

function layout(c, { title, description, pathname, body, schema = [] }) {
  const canonical = c.url + pathname;
  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="theme-color" content="#faf6ef">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;600&display=swap">
<link rel="stylesheet" href="/style.css?v=${c.cssVersion}">
${schema.map(jsonLd).join("\n")}
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<div class="promo">Livraison offerte dès ${euro(c.shipping.freeFrom)} · Expédié depuis la Belgique en ${esc(c.shipping.delay)}</div>
<header class="top">
  <a class="logo" href="/"><span class="logo-mark" aria-hidden="true">❄</span>${esc(c.name)}<span class="logo-tag">boutique</span></a>
  <nav aria-label="Principal"><a href="/#produits">Produits</a><a href="${esc(c.recipesUrl)}">Recettes</a><a href="/livraison-retours/">Livraison</a></nav>
</header>
<main id="contenu">
${body}
</main>
<footer class="foot">
  <div class="foot-grid">
    <div><strong>${esc(c.name)}</strong><p>${esc(c.tagline)}.</p></div>
    <nav aria-label="Informations"><a href="/livraison-retours/">Livraison &amp; retours</a><a href="/cgv/">Conditions générales de vente</a><a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a></nav>
    <div><p>Paiement sécurisé par carte, Bancontact ou Apple Pay.</p><p class="small">Contact : ${esc(c.seller.email)}</p></div>
  </div>
</footer>
</body>
</html>
`;
}

function card(p, images) {
  return `<article class="pcard">
  <a href="/produit/${p.slug}/">
    ${visual(p, images)}
    <div class="pcard-body">
      <h3>${esc(p.name)}</h3>
      <p class="muted">${esc(p.short)}</p>
      <p class="price">${euro(p.price)} ${p.compareAt ? `<s>${euro(p.compareAt)}</s>` : ""}</p>
    </div>
  </a>
</article>`;
}

function buyButton(c, p) {
  const link = c.paymentLinks?.[p.slug];
  return link
    ? `<a class="btn" href="${esc(link)}" rel="noopener">Commander — ${euro(p.price)}</a>`
    : `<span class="btn btn-off" aria-disabled="true">Bientôt disponible</span>`;
}

const shippingFor = (c, p) => (p.price >= c.shipping.freeFrom ? 0 : c.shipping.price);

function productSchema(c, p, images) {
  const img = images.has(`${p.slug}-1`) ? [`${c.url}/img/${p.slug}-1.webp`] : [`${c.url}/img/hero.webp`];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    image: img,
    description: p.short,
    brand: { "@type": "Brand", name: c.name },
    offers: {
      "@type": "Offer",
      url: `${c.url}/produit/${p.slug}/`,
      price: p.price.toFixed(2),
      priceCurrency: c.currency,
      availability: c.paymentLinks?.[p.slug] ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: shippingFor(c, p).toFixed(2), currency: c.currency },
        shippingDestination: c.shipping.countries.map((addressCountry) => ({ "@type": "DefinedRegion", addressCountry })),
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: c.shipping.countries,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    },
  };
}

function homePage(c, products, images) {
  const body = `
<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">Zéro film plastique · zéro sac jetable</p>
    <h1>Tes restes tiennent plus longtemps. Ta poubelle maigrit.</h1>
    <p class="lead">${esc(c.description)}</p>
    <div class="hero-cta"><a class="btn" href="/produit/kit-anti-gaspi/">Voir le kit anti-gaspi</a><a class="link" href="#produits">Tous les produits →</a></div>
    <ul class="trust"><li>Silicone alimentaire sans BPA</li><li>Retours 14 jours</li><li>Expédié de Belgique</li></ul>
  </div>
  ${images.has("hero") ? `<img class="hero-img" src="/img/hero.webp" width="1400" height="933" alt="Bols de légumes frais prêts à être conservés" fetchpriority="high" decoding="async">` : ""}
</section>
<section class="section" id="produits">
  <h2>Nos produits</h2>
  <div class="pgrid">${products.map((p) => card(p, images)).join("\n")}</div>
</section>
<section class="section split">
  ${images.has("frigo") ? `<img class="split-img" src="/img/frigo.webp" width="1000" height="667" alt="Un frigo bien rangé avec des contenants" loading="lazy" decoding="async">` : ""}
  <div>
    <h2>Pourquoi on a créé ${esc(c.name)}</h2>
    <p>Un reste qui sèche, prend une odeur ou se perd au fond du frigo finit à la poubelle. Nos couvercles et sachets ferment hermétiquement, se voient bien dans le frigo et se lavent en un geste.</p>
    <p>Et pour savoir quoi cuisiner avec ces restes, on publie chaque jour une recette sur <a href="${esc(c.recipesUrl)}">nos idées anti-gaspi</a>.</p>
  </div>
</section>`;
  return layout(c, {
    title: `${c.name} — Couvercles et sachets en silicone anti-gaspi`,
    description: c.description,
    pathname: "/",
    body,
    schema: [
      { "@context": "https://schema.org", "@type": "Organization", name: c.name, url: c.url },
      { "@context": "https://schema.org", "@type": "ItemList", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${c.url}/produit/${p.slug}/` })) },
    ],
  });
}

function productPage(c, p, products, images) {
  const others = products.filter((o) => o.slug !== p.slug);
  const ship = shippingFor(c, p);
  const body = `
<nav class="crumbs" aria-label="Fil d'Ariane"><a href="/">Boutique</a> › <span>${esc(p.name)}</span></nav>
<article class="product">
  <div class="gallery">${visual(p, images, { eager: true })}</div>
  <div class="buy">
    <h1>${esc(p.name)}</h1>
    <p class="lead">${esc(p.short)}</p>
    <p class="price big">${euro(p.price)} ${p.compareAt ? `<s>${euro(p.compareAt)}</s>` : ""}</p>
    <p class="muted small">TVA comprise · Livraison ${ship === 0 ? "offerte" : euro(ship)} · ${esc(c.shipping.delay)}</p>
    ${buyButton(c, p)}
    <ul class="bullets">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    <ul class="trust"><li>Retours 14 jours</li><li>Garantie légale 2 ans</li><li>Paiement sécurisé</li></ul>
  </div>
</article>
<section class="section narrow">
  <h2>En détail</h2>
  ${p.description.map((d) => `<p>${esc(d)}</p>`).join("")}
  <table class="specs">${Object.entries(p.specs).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</table>
  <h2>Questions fréquentes</h2>
  ${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
</section>
<section class="section"><h2>Tu aimeras aussi</h2><div class="pgrid">${others.map((o) => card(o, images)).join("")}</div></section>`;
  return layout(c, {
    title: `${p.name} | ${c.name}`,
    description: `${p.short} ${euro(p.price)}, expédié depuis la Belgique.`,
    pathname: `/produit/${p.slug}/`,
    body,
    schema: [productSchema(c, p, images)],
  });
}

// Pages légales : contenu belge standard, à relire avant d'ouvrir les ventes.
function legalPages(c) {
  const s = c.seller;
  const page = (slug, title, html) => [`/${slug}/`, layout(c, { title: `${title} | ${c.name}`, description: `${title} de la boutique ${c.name}.`, pathname: `/${slug}/`, body: `<section class="section narrow prose"><h1>${title}</h1>${html}</section>` })];
  return [
    page("livraison-retours", "Livraison et retours", `
<h2>Livraison</h2><p>Expédition sous 1 jour ouvrable depuis la Belgique, livraison en ${esc(c.shipping.delay)} vers la Belgique, la France, le Luxembourg et les Pays-Bas. Frais : ${euro(c.shipping.price)}, offerts dès ${euro(c.shipping.freeFrom)} d'achat.</p>
<h2>Retours</h2><p>Tu disposes de 14 jours après réception pour changer d'avis, sans justification. Écris-nous à ${esc(s.email)} : nous te répondons avec l'adresse de retour. Le produit doit être renvoyé non utilisé ; les frais de retour sont à ta charge. Le remboursement intervient dans les 14 jours suivant la réception du retour.</p>
<h2>Produit défectueux</h2><p>Tous nos produits bénéficient de la garantie légale de conformité de 2 ans. Envoie-nous une photo : nous remplaçons ou remboursons, frais de port compris.</p>`),
    page("cgv", "Conditions générales de vente", `
<p>Les présentes conditions s'appliquent à toute commande passée sur ce site auprès de ${esc(s.legalName)}, ${esc(s.address)}, numéro d'entreprise ${esc(s.bce)}, TVA ${esc(s.vat)}.</p>
<h2>Prix</h2><p>Les prix sont indiqués en euros, TVA comprise, hors frais de livraison précisés avant le paiement.</p>
<h2>Commande et paiement</h2><p>La commande est ferme après paiement via notre prestataire sécurisé (Stripe). Une confirmation est envoyée par e-mail.</p>
<h2>Droit de rétractation</h2><p>Conformément au Code de droit économique (livre VI), le consommateur dispose de 14 jours à compter de la réception pour se rétracter, sans motif, en nous informant par e-mail. Voir <a href="/livraison-retours/">Livraison et retours</a>.</p>
<h2>Garantie</h2><p>Garantie légale de conformité de 2 ans (articles 1649bis et suivants de l'ancien Code civil).</p>
<h2>Litiges</h2><p>En cas de litige, contacte-nous d'abord. Tu peux aussi saisir le Service de médiation pour le consommateur (mediationconsommateur.be). Droit belge applicable.</p>`),
    page("mentions-legales", "Mentions légales", `
<p>Éditeur et vendeur : ${esc(s.legalName)}<br>Adresse : ${esc(s.address)}<br>Numéro d'entreprise (BCE) : ${esc(s.bce)}<br>TVA : ${esc(s.vat)}<br>Contact : ${esc(s.email)}</p>
<p>Hébergement : GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
<p>Photos d'ambiance : Unsplash.</p>`),
    page("confidentialite", "Politique de confidentialité", `
<p>Ce site ne dépose aucun cookie de suivi. Les données de commande (nom, adresse, e-mail) sont collectées par notre prestataire de paiement Stripe uniquement pour traiter et livrer ta commande, et conservées le temps imposé par la loi comptable.</p>
<p>Tu peux demander l'accès, la rectification ou la suppression de tes données à ${esc(s.email)}. Autorité de contrôle : Autorité de protection des données (autoriteprotectiondonnees.be).</p>`),
  ];
}

// Flux Google Merchant Center (fiches produits gratuites sur Google Shopping).
function merchantFeed(c, products, images) {
  const item = (p) => `<item>
  <g:id>${esc(p.sku)}</g:id>
  <g:title>${esc(p.name)}</g:title>
  <g:description>${esc(p.short + " " + p.bullets.join(". "))}</g:description>
  <g:link>${c.url}/produit/${p.slug}/</g:link>
  <g:image_link>${images.has(`${p.slug}-1`) ? `${c.url}/img/${p.slug}-1.webp` : `${c.url}/img/hero.webp`}</g:image_link>
  <g:availability>${c.paymentLinks?.[p.slug] ? "in_stock" : "preorder"}</g:availability>
  <g:price>${p.price.toFixed(2)} ${c.currency}</g:price>
  <g:brand>${esc(c.name)}</g:brand>
  <g:condition>new</g:condition>
  <g:identifier_exists>no</g:identifier_exists>
  <g:shipping_weight>${p.weightGrams} g</g:shipping_weight>
</item>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
<title>${esc(c.name)}</title><link>${c.url}</link><description>${esc(c.description)}</description>
${products.map(item).join("\n")}
</channel></rss>
`;
}

export function build({ out = path.join(root, "dist") } = {}) {
  const c = read("shop.config.json");
  const products = read("products.json");
  for (const p of products) if (!p.slug || !p.name || !(p.price > 0) || !p.bullets?.length) throw new Error(`Produit incomplet : ${p.slug}`);
  c.cssVersion = createHash("sha1").update(fs.readFileSync(path.join(root, "src/style.css"))).digest("hex").slice(0, 8);
  const imgDir = path.join(root, "src/img");
  const images = new Set(fs.readdirSync(imgDir).map((f) => f.replace(/\.webp$/, "")));

  const pages = new Map([["/", homePage(c, products, images)], ...legalPages(c)]);
  for (const p of products) pages.set(`/produit/${p.slug}/`, productPage(c, p, products, images));
  pages.set("/404.html", layout(c, { title: `Page introuvable | ${c.name}`, description: c.description, pathname: "/404.html", body: `<section class="section narrow"><h1>Cette page n'existe pas.</h1><p class="lead"><a href="/">Retour à la boutique</a></p></section>` }));

  // Site servi dans un sous-dossier (GitHub Pages) : on préfixe les liens internes.
  const base = new URL(c.url).pathname.replace(/\/$/, "");
  const withBase = (html) => html.replace(/(href|src)="\//g, `$1="${base}/`);

  fs.rmSync(out, { recursive: true, force: true });
  for (const [url, html] of pages) write(out, url.endsWith(".html") ? url : url + "index.html", withBase(html));
  fs.copyFileSync(path.join(root, "src/style.css"), path.join(out, "style.css"));
  fs.copyFileSync(path.join(root, "src/favicon.svg"), path.join(out, "favicon.svg"));
  fs.cpSync(imgDir, path.join(out, "img"), { recursive: true });
  write(out, "/feed.xml", merchantFeed(c, products, images));
  const urls = [...pages.keys()].filter((u) => !u.endsWith(".html"));
  write(out, "/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${c.url}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
  write(out, "/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${c.url}/sitemap.xml\n`);
  return { pages: pages.size, products: products.length };
}

function write(out, url, content) {
  const file = path.join(out, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = build();
  console.log(`Boutique construite : ${s.pages} pages, ${s.products} produits -> dist/`);
}
