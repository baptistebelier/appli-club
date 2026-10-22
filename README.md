# /RAM Club — démo

Démo publique de /RAM Club : https://baptistebelier.github.io/appli-club/

**Ce dépôt est un miroir. Ne le modifie pas à la main.**

La seule source du code est le dossier `club/` du dépôt
[padel-ja](https://github.com/baptistebelier/padel-ja). C'est là que l'appli est servie
avec les vrais comptes /RAM (club.riseandmove.fr ou ja.riseandmove.fr/club/).

Toutes les 3 heures, l'action « Miroir depuis padel-ja » recopie `club/` ici, ce qui met
à jour la démo GitHub Pages. Pour forcer une mise à jour : onglet **Actions** →
**Miroir depuis padel-ja** → **Run workflow**.

Sans serveur, l'appli tourne en mode démo avec des données fictives.
Les pages `connexion.html` et `presentation.html` ne sont pas copiées : elles ont besoin du serveur.
