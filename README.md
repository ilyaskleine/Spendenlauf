## Spendenlauf 2024
Das ist das Repository für meine Umsetzung einer Web-App, die das Zählen der gelaufen Runden, der insgesamten Spenden und der Verwaltung der Läufer stark vereinfacht.
## Geplante Funktionen
- [x] Einfaches Runden Zählen durch Klicken auf die Startnummer
- [x] Ein Live-Dashboard des eingelaufenen Gesamtbetrags
## Mögliche Funktionen
- ~~Ein persönliches Dashboard für jeden Läufer, auf dem er seine Runden(zeiten) und den erlaufenen Betrag sehen kann~~
- ~~Die Möglichkeit für die Läufer, ihre Spender vor dem Lauf online einzutragen, so dass die SMV diese nicht selbst eintragen muss~~
## Enviroment-Variablen
Folgende Variablen müssen in einer .env Datei angelegt werden, da sie aus Sicherheitsgründen nicht geteilt werden sollten oder der einfachheit halber hardcoded sind
- PORT= (Gewünschter Netzwerkport)

- MYSQL_HOST= (IP-Adresse der Datenbank / localhost)
- MYSQL_USER= (Angelgter Nutzername oder root)
- MYSQL_PASSWORD= (Festgelegtes Passwort)
- MYSQL_DB=spendenlauf (oder ein anderer Name)

- ADMIN_PASSWORD= (Das Passwort für den Adminbereich)

- SPENDENLAUF_ID= (Die Datenbankeintrag-ID des aktuellen Laufs)
