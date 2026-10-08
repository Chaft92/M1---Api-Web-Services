# API My Social Networks

API REST pour la gestion d'événements, de groupes, de fils de discussion, d'albums photo,
de sondages et de billetterie. Node.js, Express, MongoDB (Mongoose).

Tous les exemples ci-dessous utilisent le même fil conducteur : un club d'astronomie amateur
qui organise des soirées d'observation (plus parlant que des exemples "user1" / "test").

## Authentification

Toutes les routes marquées 🔒 attendent un header `Authorization: Bearer <token>`,
obtenu via `POST /login`. Le token contient l'id de l'utilisateur, valable 1h.

```
POST /login
{ "email": "nova.lefort@astroclub.fr", "password": "comete2024" }

-> 200 { "token": "eyJ..." }
```

## Utilisateurs

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /users | non | Créer un compte (email unique) |
| GET | /users | non | Lister les utilisateurs |
| GET | /users/:id | non | Un utilisateur |
| PUT | /users/:id | 🔒 | Modifier un utilisateur |
| PATCH | /users/:id | 🔒 | Modifier partiellement |
| DELETE | /users/:id | 🔒 | Supprimer |

```
POST /users
{ "firstname": "Nova", "lastname": "Lefort", "age": 29, "email": "nova.lefort@astroclub.fr", "password": "comete2024" }
```

## Événements

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /events | 🔒 | Créer un événement |
| GET | /events | non | Lister les événements |
| GET | /events/:id | non | Un événement |
| PUT | /events/:id | 🔒 | Modifier |
| DELETE | /events/:id | 🔒 | Supprimer |

```
POST /events
{
  "name": "Nuit des Perséides",
  "description": "Observation de la pluie de météores depuis le plateau du Vercors",
  "startDate": "2026-08-12T21:00:00Z",
  "endDate": "2026-08-13T02:00:00Z",
  "location": "Col de Rousset",
  "coverPhoto": "https://astroclub.fr/perseides.jpg",
  "isPrivate": false,
  "organizers": ["66f1a2b3c4d5e6f7a8b9c0d1"],
  "participants": []
}
```

## Groupes

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /groups | 🔒 | Créer un groupe |
| GET | /groups | non | Lister les groupes |
| GET | /groups/:id | non | Un groupe |
| PUT | /groups/:id | 🔒 | Modifier |
| DELETE | /groups/:id | 🔒 | Supprimer |

`type` : `public`, `private` ou `secret`.

```
POST /groups
{
  "name": "Chasseurs de comètes du Vercors",
  "description": "Repérage et suivi des comètes visibles à l'œil nu",
  "type": "public",
  "allowMemberPosts": true,
  "allowMemberEvents": true,
  "admins": ["66f1a2b3c4d5e6f7a8b9c0d1"],
  "members": ["66f1a2b3c4d5e6f7a8b9c0d1"]
}
```

## Fils de discussion

Un fil est lié à **exactement** un groupe ou un événement (jamais les deux, jamais aucun).

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /threads | 🔒 | Créer un fil (`{ "group": id }` ou `{ "event": id }`) |
| GET | /threads?group=:id ou ?event=:id | non | Lister les fils d'un groupe/événement |
| GET | /threads/:id | non | Un fil |
| DELETE | /threads/:id | 🔒 | Supprimer |
| POST | /threads/:threadId/messages | 🔒 | Poster un message (`parentMessage` optionnel pour répondre) |
| GET | /threads/:threadId/messages | non | Lister les messages |

```
POST /threads/:threadId/messages
{ "content": "Qui a une paire de jumelles 10x50 à prêter pour la nuit des Perséides ?" }

POST /threads/:threadId/messages   (réponse au message précédent)
{ "content": "J'en ai une, je l'apporte", "parentMessage": "66f1a2b3c4d5e6f7a8b9c0e2" }
```

## Albums photo d'événement

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /events/:eventId/albums | 🔒 | Créer un album pour l'événement |
| GET | /events/:eventId/albums | non | Lister les albums |
| POST | /albums/:albumId/photos | 🔒 | Poster une photo |
| GET | /albums/:albumId/photos | non | Lister les photos |
| POST | /photos/:photoId/comments | 🔒 | Commenter une photo |

```
POST /albums/:albumId/photos
{ "url": "https://astroclub.fr/photos/voie-lactee-vercors.jpg" }

POST /photos/:photoId/comments
{ "text": "Le halo autour de la lune est magnifique sur ce cliché" }
```

## Sondages

Création réservée à un organisateur de l'événement. Chaque participant répond une seule fois.

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /events/:eventId/polls | 🔒 (organisateur) | Créer un sondage |
| GET | /events/:eventId/polls | non | Lister les sondages |
| POST | /polls/:pollId/responses | 🔒 | Répondre (une fois par personne) |

```
POST /events/:eventId/polls
{
  "questions": [
    {
      "text": "Quel télescope faut-il apporter en priorité ?",
      "options": ["Dobson 200mm", "Lunette 80ED", "Jumelles seules"]
    },
    {
      "text": "À quelle heure arrives-tu sur site ?",
      "options": ["19h", "20h30", "après la tombée de la nuit"]
    }
  ]
}

POST /polls/:pollId/responses
{ "answers": [{ "questionIndex": 0, "chosenOptionIndex": 0 }, { "questionIndex": 1, "chosenOptionIndex": 1 }] }
```

## Billetterie

Les types de billets sont créés par un organisateur. L'achat d'un billet est ouvert
à tous (une personne extérieure n'a pas forcément de compte), limité à 1 billet par
email et par type, dans la limite du stock défini.

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | /events/:eventId/ticket-types | 🔒 (organisateur) | Créer un type de billet |
| GET | /events/:eventId/ticket-types | non | Lister les types de billets |
| POST | /ticket-types/:ticketTypeId/tickets | non | Acheter un billet |
| GET | /ticket-types/:ticketTypeId/tickets | 🔒 | Lister les billets vendus |

```
POST /events/:eventId/ticket-types
{ "name": "Place soirée observation", "price": 12, "quantity": 40 }

POST /ticket-types/:ticketTypeId/tickets
{
  "firstname": "Léo",
  "lastname": "Garrigue",
  "address": "4 rue des Étoiles, 26190 Saint-Agnan-en-Vercors",
  "email": "leo.garrigue@mail.fr"
}
```

## Codes de réponse

`200` lecture/modification réussie, `201` création réussie, `400` donnée invalide,
`401` non authentifié, `403` authentifié mais pas autorisé (ex: sondage créé par un
non-organisateur), `404` ressource introuvable, `409` conflit (billet déjà pris, stock
épuisé, vote déjà enregistré), `429` trop de requêtes, `500` erreur serveur.

## Non traité dans cette version

Les deux fonctionnalités bonus du cahier des charges (shopping list et covoiturage par
événement) ne sont pas implémentées.
