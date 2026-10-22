# Images produit avec ChatGPT

Une fois le stock reçu, **prends d'abord 2 photos de chaque produit au téléphone** (sur une table, lumière du jour)
et donne-les à ChatGPT avec le prompt : il gardera le vrai produit et créera un beau visuel.
Ne vends jamais avec une image qui ne montre pas le vrai produit (règle des plateformes + droit belge).

## Où mettre les images

- Format carré 1:1, au moins 1600 × 1600 px, exporte en `.webp` (ou demande à Claude de convertir).
- Nom des fichiers dans `src/img/` : `<slug>-1.webp` (photo principale), `<slug>-2.webp`, `<slug>-3.webp`…
  - `couvercles-silicone-extensibles-1.webp`
  - `sachets-silicone-reutilisables-1.webp`
  - `kit-anti-gaspi-1.webp`
- Dès qu'un fichier `-1` existe, le site l'utilise automatiquement à la place de l'icône.
- eBay / Amazon : image principale sur **fond blanc pur**, produit = 85 % de l'image, sans texte (obligatoire sur Amazon).

## Prompts (copie-colle, en joignant ta photo)

### 1. Photo principale fond blanc (Amazon, eBay, Google)
```
Voici la photo de mon produit : [nom du produit]. Crée une photo e-commerce professionnelle
de CE produit exact (même forme, même couleur, même nombre de pièces), sur fond blanc pur #FFFFFF,
éclairage studio doux, ombre légère au sol, produit centré occupant 85 % du cadre, format carré 1:1,
ultra net, aucun texte, aucun logo ajouté.
```

### 2. Mise en situation (site, Facebook, 2ememain)
```
À partir de ma photo de [nom du produit], crée une photo lifestyle réaliste : cuisine belge lumineuse,
plan de travail en bois clair, lumière naturelle du matin. Le produit est utilisé :
[couvercles : posés et étirés sur un bol de soupe, un demi-oignon et un pot en verre]
[sachets : remplis de légumes coupés et de soupe, debout sur le plan de travail]
Palette crème, vert sauge et touches de tomate. Format carré 1:1. Le produit doit rester identique à ma photo.
Aucun texte.
```

### 3. Image « tailles et contenu » (Amazon image 2, eBay image 2)
```
Crée une infographie épurée sur fond crème (#FAF6EF) montrant les [6 couvercles / 4 sachets] de ma photo
alignés du plus petit au plus grand, avec sous chacun sa taille en grand chiffre lisible :
[6,5 cm, 9,5 cm, 11,5 cm, 14 cm, 16 cm, 20,5 cm] / [500 ml, 500 ml, 1 L, 1,5 L].
Police sans-serif moderne, couleur vert foncé #2F6B4F. Format carré 1:1.
```

### 4. Image « avantages » (Amazon image 3)
```
Infographie carrée 1:1, fond crème #FAF6EF, mon produit [nom] à gauche, à droite 4 pictogrammes simples
vert #2F6B4F avec un texte court en français : « Sans BPA », « Lave-vaisselle », « -40 °C à 230 °C »,
« Remplace le film plastique ». Style propre et premium, beaucoup d'espace.
```

### 5. Kit cadeau
```
Photo produit du kit : les 6 couvercles et les 4 sachets de mes photos, joliment disposés devant une boîte
en carton kraft ouverte, fond blanc, éclairage studio, format carré 1:1, aucun texte.
```
