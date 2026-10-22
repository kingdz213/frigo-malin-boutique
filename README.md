# Frigo Malin — boutique

Boutique de la marque Frigo Malin (le site de recettes anti-gaspi) : accessoires en silicone qui font durer les restes.

- **Boutique en ligne** : https://kingdz213.github.io/frigo-malin-boutique/
- **Annonces prêtes à copier-coller** (eBay, Amazon, 2ememain, Facebook Marketplace) : [ANNONCES.md](ANNONCES.md)
- **Prompts d'images ChatGPT** : [IMAGES.md](IMAGES.md)
- **Flux Google Shopping** (fiches gratuites) : https://kingdz213.github.io/frigo-malin-boutique/feed.xml
- **Choix et calculs** : [DECISIONS.md](DECISIONS.md)

Tant qu'il n'y a pas de lien de paiement, les boutons affichent « Bientôt disponible » : personne ne peut payer un produit que tu n'as pas encore.

## Les produits

| Produit | Prix | Coût estimé* | Marge estimée** |
|---|---|---|---|
| Couvercles extensibles silicone ×6 | 12,90 € | ~2,50 € | ~6 € |
| Sachets silicone zip ×4 | 16,90 € | ~4,50 € | ~7 € |
| Kit (les deux), livraison offerte | 26,90 € | ~7 € + ~5 € envoi | ~9 € |

\* Achat en gros + transport + emballage, à confirmer avec le fournisseur. \*\* Après TVA 21 % et frais de plateforme moyens.

## Ce que TOI seul peux faire (dans l'ordre)

1. **Statut** : pour vendre régulièrement, il faut un numéro d'entreprise (indépendant complémentaire, via un guichet d'entreprises). Mets-le ensuite dans `shop.config.json` → `seller`.
2. **Stock** : commande des échantillons (2-3 fournisseurs, voir DECISIONS.md), **exige la déclaration de conformité contact alimentaire UE (règlement 1935/2004) + un rapport de test LFGB**. Obligatoire pour vendre un objet qui touche la nourriture.
3. **Photos** : 2 photos au téléphone par produit, puis les prompts de [IMAGES.md](IMAGES.md). Mets les images dans `src/img/` (dis-moi « images prêtes », je m'occupe du reste).
4. **Paiement** (gratuit, commission par vente) : crée un compte **Stripe**, puis un *Payment Link* par produit (carte, Bancontact, Apple Pay, adresse de livraison obligatoire). Colle les 3 liens dans `shop.config.json` :
   ```json
   "paymentLinks": {
     "couvercles-silicone-extensibles": "https://buy.stripe.com/...",
     "sachets-silicone-reutilisables": "https://buy.stripe.com/...",
     "kit-anti-gaspi": "https://buy.stripe.com/..."
   }
   ```
   Le site passe alors en « Commander » tout seul.
5. **Plateformes gratuites** (copie les textes de [ANNONCES.md](ANNONCES.md)) :
   - **eBay.be / eBay.fr** : compte gratuit, annonces gratuites (vérifie les frais du moment dans « Frais vendeur »).
   - **Amazon.com.be** : plan *Individuel* (pas d'abonnement, ~0,99 € par vente + commission), ou *Professionnel* au-delà d'environ 40 ventes/mois.
   - **2ememain.be** et **Facebook Marketplace** : gratuits, idéal pour démarrer en local.
   - **Google Merchant Center** : gratuit, ajoute le flux `feed.xml` ci-dessus → produits visibles dans Google Shopping.
6. **Envoi** : bpost (petit paquet) ou Mondial Relay/Shop&Go, enveloppes matelassées pour les couvercles.

## Commandes

| Commande | Effet |
|---|---|
| `npm test` | vérifie annonces, pages, flux Google |
| `npm run build` | construit le site dans `dist/` |
| `npm run annonces` | régénère `ANNONCES.md` depuis `products.json` |

Changer un prix ou un texte : modifie `products.json`, puis `npm run annonces` et push : le site se met à jour seul.
