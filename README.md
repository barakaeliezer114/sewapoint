# Inkinet

Crée l'application web multi-services "Inkinet", une plateforme moderne, responsive et intuitive où l'administrateur sert d'INTERMÉDIAIRE UNIQUE entre les offreurs et les demandeurs de biens et services.

### 1. Identité & Concept ("Inkinet")
- Nom du projet : Inkinet
- Rôle : Intermédiaire unique et centrale de réservation / commande.
- Principe : Aucun contact direct entre les visiteurs et les vendeurs/propriétaires tiers.
- Flux de commande : Tous les boutons d'action ("Commander", "Réserver", "Demander une visite", "Acheter") déclenchent une prise de contact DIRECTE avec l'administrateur Inkinet (via bouton WhatsApp pré-rempli ou formulaire interne). L'administrateur reçoit la référence exacte du produit/service, traite la demande, puis fait la liaison.

### 2. Structure & Catégories du Catalogue
Organiser le catalogue avec des onglets et filtres clairs :
1. Immobilier & Terrains (Parcelles & Maisons : à vendre, à louer)
2. Hébergement & Séjours (Hôtels, Auberges & Résidences meublées)
3. Événements & Loisirs (Salles de fêtes & Réceptions, Cités & Sites touristiques)
4. Logements Étudiants (Homes & Cités étudiantes à proximité des campus)
5. Gaming & Informatique (PC : Jeux vidéo PC, vente de laptops et desktops neufs / reconditionnés)
6. Mode & Style Étudiant (Chaussures, vêtements, accessoires pour étudiants)
7. Équipements & Machines (Machines industrielles/chantier, outillage, filtre Neuf vs Seconde main)

### 3. Gestion des Médias & Fiches Produits
- Galerie photos haute qualité et lecteur vidéo intégré (visites virtuelles de biens/salles, démos gaming, vidéos de présentation produits).
- Fiche détaillée pour chaque article : titre, prix, état (Neuf / Occasion), caractéristiques techniques ou variantes (tailles, couleurs), statut de disponibilité, et bouton d'action WhatsApp pré-rempli avec référence unique, nom et prix.

### 4. Espace Administration (Dashboard Inkinet)
- Interface de gestion permettant d'ajouter de nouvelles annonces (catégorie, photos/vidéos, caractéristiques, prix, statut).
- Gestion des statuts : "Disponible", "En réserve", "Rupture de stock", "Vendu / Occupé".
- Configuration du numéro WhatsApp de l'administrateur Inkinet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sewapoint.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6ccd30e6-5986-4256-b5eb-5816b5d82be6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
