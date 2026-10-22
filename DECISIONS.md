# Décisions — boutique Frigo Malin (22/10/2026)

| Décision | Pourquoi |
|---|---|
| Produits : couvercles extensibles + sachets zip en silicone + kit | Légers (envoi petit paquet), pas fragiles, pas électriques (pas de marquage CE), achat récurrent/cadeau, marge ×4-5 sur le coût, et cohérents avec le site de recettes anti-gaspi qui leur amène du trafic gratuit. |
| Même marque que le site de recettes | Le site attire déjà les bons clients (gens qui veulent ne plus jeter) ; la boutique les convertit. |
| Kit à 26,90 € avec livraison offerte dès 25 € | Le seuil de 25 € pousse vers le kit (panier moyen plus haut) ; un kit d'objets légers coûte ~5 € à envoyer. |
| Site statique sur GitHub Pages + liens de paiement Stripe | Gratuit, rien à maintenir, pas de Shopify à 30 €/mois ; Stripe gère carte, Bancontact, Apple Pay, adresses et e-mails de confirmation. |
| Boutons « Bientôt disponible » sans lien Stripe | On ne peut pas encaisser avant d'avoir le stock. |
| Pages légales belges (CGV, rétractation 14 jours, garantie 2 ans, médiation, RGPD) avec champs « À COMPLÉTER » | Obligatoires pour vendre en ligne en Belgique ; les données vendeur (BCE, TVA, adresse) sont à toi. À faire relire si possible. |
| Flux Google Merchant `feed.xml` | Fiches Google Shopping gratuites. Disponibilité « preorder » tant qu'il n'y a pas de lien de paiement. |
| `ANNONCES.md` généré depuis `products.json` | Une seule source de vérité : un prix changé est changé partout. Titres eBay ≤ 80 car., Amazon ≤ 200, puces ≤ 250. |
| Visuels produit = icônes SVG en attendant les vraies photos | Pas de photo du vrai produit disponible ; montrer un autre produit serait trompeur. |
| Pas Vinted, pas Etsy, pas Shopify | Vinted demandé exclu ; Etsy facture l'ouverture et vise le fait-main ; Shopify est payant. |

## Sourcing (à valider avec des échantillons)

Mots-clés pour les fournisseurs (Alibaba, ou grossistes européens pour un délai plus court) :
- « silicone stretch lids 6 pcs food grade LFGB » — viser ~0,90-1,60 $ le lot à 200-500 unités
- « reusable silicone food storage bags set of 4 zip leakproof LFGB » — viser ~2,50-3,80 $ le lot

À exiger : échantillon, déclaration de conformité UE contact alimentaire (règlement 1935/2004), rapport de test LFGB,
emballage carton sans plastique, ton logo (option). Ces prix sont des ordres de grandeur, pas des devis.
