// Génère ANNONCES.md : une annonce prête à copier-coller par produit et par plateforme,
// à partir de products.json (une seule source de vérité). Usage : npm run annonces
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { euro } from "./build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const c = JSON.parse(fs.readFileSync(path.join(root, "shop.config.json"), "utf8"));
const products = JSON.parse(fs.readFileSync(path.join(root, "products.json"), "utf8"));

// Coupe au dernier mot entier sous la limite de caractères de la plateforme.
export function fit(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s—,;:-]+$/, "");
}

const plain = (p) => p.name.replace(" — ", " ");

// Mots des mots-clés absents du titre (pluriel ignoré) : évite « couvercles … couvercle ».
function extraKeywords(p) {
  const norm = (w) => w.toLowerCase().replace(/s$/, "");
  const seen = new Set(plain(p).split(/\s+/).map(norm));
  return p.keywords.flatMap((k) => {
    const fresh = k.split(/\s+/).filter((w) => !seen.has(norm(w)));
    fresh.forEach((w) => seen.add(norm(w)));
    return fresh.length ? [fresh.join(" ")] : [];
  });
}

// Ajoute des expressions entières tant que la limite n'est pas dépassée (jamais de mot coupé en plein milieu d'une expression).
function title(base, phrases, max, sep = " ") {
  let t = base;
  for (const ph of phrases) if ((t + sep + ph).length <= max) t += sep + ph;
  return fit(t, max);
}

export function listings(p) {
  const specs = Object.entries(p.specs).map(([k, v]) => `${k} : ${v}`);
  const desc = [...p.description, "", ...p.bullets.map((b) => `✔ ${b}`), "", ...specs];
  return {
    ebay: {
      titre: title(plain(p), extraKeywords(p), 80),
      prix: euro(p.price),
      etat: "Neuf",
      description: [...desc, "", `Expédié depuis la Belgique sous 24 h ouvrables (${c.shipping.delay}).`, "Retours acceptés 14 jours."].join("\n"),
    },
    amazon: {
      titre: title(`${c.name} ${plain(p)} –`, extraKeywords(p), 200, " ").replace(/–$/, "").trim(),
      puces: p.bullets.slice(0, 5).map((b) => fit(b.toUpperCase().slice(0, 1) + b.slice(1), 250)),
      description: p.description.join("\n\n"),
      motsCles: fit(p.keywords.join(" "), 249),
    },
    marketplace: {
      titre: fit(plain(p), 70),
      prix: euro(p.price),
      description: [p.short, "", ...p.bullets.map((b) => `• ${b}`), "", "Neuf, jamais utilisé. Envoi bpost ou remise en main propre."].join("\n"),
    },
  };
}

function markdown() {
  const out = [`# Annonces prêtes à copier-coller — ${c.name}`, "", "_Généré par `npm run annonces` depuis `products.json`. Modifie le JSON puis relance, ne modifie pas ce fichier à la main._", ""];
  for (const p of products) {
    const l = listings(p);
    out.push(`---`, ``, `## ${p.name} — ${euro(p.price)} (SKU ${p.sku})`, ``);
    out.push(`### eBay (titre ${l.ebay.titre.length}/80)`, "```", l.ebay.titre, "```", `Prix : ${l.ebay.prix} · État : ${l.ebay.etat}`, "```", l.ebay.description, "```", "");
    out.push(`### Amazon.com.be / .fr (titre ${l.amazon.titre.length}/200)`, "```", l.amazon.titre, "```", "Puces :", "```", ...l.amazon.puces, "```", "Description :", "```", l.amazon.description, "```", "Mots-clés (backend) :", "```", l.amazon.motsCles, "```", "");
    out.push(`### 2ememain.be, Facebook Marketplace, Leboncoin`, "```", l.marketplace.titre, "```", `Prix : ${l.marketplace.prix}`, "```", l.marketplace.description, "```", "");
  }
  return out.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(path.join(root, "ANNONCES.md"), markdown());
  console.log(`ANNONCES.md écrit (${products.length} produits × 3 plateformes)`);
}
