# Verwijsafspraken.nl

[Verwijsafspraken.nl](https://verwijsafspraken.nl) is een initiatief van [Help
de Huisarts Verzuipt](https://www.helpdehuisartsverzuipt.nl/). Het geeft collega
zorginstellingen inzicht in de vraag wanneer de huisarts betrokken moet worden
bij een proces, en de huisarts een duidelijk antwoord om te delen.

[Verwijsafspraken.nl](https://verwijsafspraken.nl) is [Open
Source](https://nl.wikipedia.org/wiki/Open_source). Dat betekent dat iedereen
kan en mag bijdragen aan deze website (net zoals bij bijvoorbeeld Wikipedia), en
fouten snel kunnen worden hersteld.

## Waarom

Het gaat niet goed met de huisartsenzorg in Nederland. De laatste jaren is de
werkdruk enorm toegenomen. Niet iedereen kan dit volhouden. Tweederde van de
artsen overweegt (eerder) te stoppen met het werk. Huisartsenpraktijken zitten
vol en patiënten moeten noodgedwongen soms lang wachten op een afspraak om langs
te komen. Administratielast, regeldruk en toenemende zorgvraag wegens
vergrijzing spelen allemaal een rol.

Laten we met elkaar ervoor zorgen dat onzinnig papierwerk en bureaucratie
voorkomen worden. Hierdoor wordt de huisarts weer in zijn/haar kracht gezet en
ontvangen u en uw naasten alle aandacht wanneer het écht nodig is.

## Aanpassingen maken

Alle inhoud van deze website staat in één bestand dat je [op deze website kunt
bewerken](https://github.com/verwijsafspraken/verwijsafspraken/edit/main/database.json).
Je hebt daarvoor wel een [Github account
nodig](https://github.com/signup?return_to=https%3A%2F%2Fgithub.com%2Fverwijsafspraken%2Fverwijsafspraken%2Fedit%2Fmain%2Fdatabase.json&source=login).
Wijzigingen moeten eerst worden goedgekeurd voordat ze online zichtbaar worden.

## Voor ontwikkelaars

### Lokale ontwikkeling

```bash
git clone git@github.com:verwijsafspraken/verwijsafspraken.git
cd verwijsafspraken
npm install
npm start
```

De website moet nu draaien op poort 9000.

### Hosting

De website wordt gehost door middel van Github Pages, en elke push / merge naar
de `main` branch triggert een nieuwe deploy.
