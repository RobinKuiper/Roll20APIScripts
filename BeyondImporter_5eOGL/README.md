## BeyondImporter

#### Created By

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* My Discord Server: https://discord.gg/AcC9VME
* Roll20: https://app.roll20.net/users/1226016/robin
* Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

#### Modified By

* Name: Matt DeKok
* Discord: Sillvva#2532
* Roll20: https://app.roll20.net/users/494585/sillvva

* Name: Ammo Goettsch
* Discord: ammo#7063 
* Roll20: https://app.roll20.net/users/2990964/ammo

---

```
NOTICE: The commands are changed since the last update, read the description below.
```

Beyond Importer let's you import a character sheet from DNDBeyond into Roll20.
There are 2 versions of the Beyond Importer, one for the [5e Shaped Sheet](https://bitbucket.org/mlenser/5eshaped/wiki/Home) and one for the [5e OGL sheet](https://wiki.roll20.net/5th_Edition_OGL_by_Roll20).

**Both version work the same.**

At the moment this is still in development. But the main import is working, let me know if you find any errors or if you have any suggestions.

### How it works
Go to the character page on DNDBeyond and put '/json' after the url, eg:

```
https://www.dndbeyond.com/profile/Atheos/characters/1307201/json
```

Copy the entire content of that page, and go to Roll20.
In the Roll20 chat type the command `!beyond --import` and paste the copied contents after that, eg:

```
!beyond --import {"character":{"id":1307201,"name":"Qroohk","player":"Atheos","age":null,"hair":null,"eyes":null,"skin":null,"height":null,"weight":null,"size":"Medium","alignment":"Lawful Good" ..........
```

Your character will be imported now!

**Note:** If you have multiple players in your game using this script, I recommend only importing one at a time.

**Note:** I recommend giving spellcasters with a lot of spells an extra minute or two before opening the character sheet.

### Commands

* **!beyond --help** - Shows the help menu.
* **!beyond --config** - Shows the config menu.
* **!beyond --import [CHARACTER JSON]** - Imports a character from the DNDBeyond json.

![Config Menu](https://i.imgur.com/KKvT3s2.png "Config Menu")

Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets

--- 

#### Changelog:

**For further updates [click here](https://github.com/sillvva/Roll20-API-Scripts/commits/master)**

**v0.2.6 - by Matt DeKok (Sillvva)**
* Implemented updates made by Roll20 5eOGL character sheet
* Implemented updates made to structure of D&D Beyond's character JSON
* Excluded generic racial and class traits (eg. Hit Points, Ability Score Improvement, Age)
* Fixed items that set Ability Scores (eg. Belt of Hill Giant Strength)
* Fixed Unarmored Defense
* Set some default sheet options (ex. Auto Roll Damage & Crit, Modifier Fields, etc)

**v0.1.11**
* Fixed HP Calculations.

**v0.1.10**
* Unarmored Defense shows in inventory.
* Spells are now added as attacks with save DC.
