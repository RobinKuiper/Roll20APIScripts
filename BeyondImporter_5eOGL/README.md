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

**Both versions work the same.**

At the moment this is still in development. But the main import is working, let me know if you find any errors or if you have any suggestions.

### How it works

Go to the character page on DNDBeyond and retrieve the Character ID. The character ID is a numerical ID consisting of at least 6 characters. In the below example URL, the character ID is `1307201`.

```
https://www.dndbeyond.com/profile/Atheos/characters/1307201
```

Once you have the character ID, open another browser window, enter the below URL and **add the character ID to the end of it**. 

```
https://character-service.dndbeyond.com/character/v3/character/
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
**v0.4.0**
* added configurable feature 'Spell Info in Attacks' (enabled by default) which adds more information to spell attacks
* fixed items not being added to Armor Class #34
* rewrite of proficiencies and bonuses, fixing many cases of combinations of modifiers
* Alert feat now supported, including in combination with other initiative bonuses #33
* Jack of All Trades now implemented by Roll20 feature instead of fixed bonuses
* Items that grant ability score bonus now work
* Backgrounds with missing feature no longer crash #38
* Class features with options like Fighting Style imported correctly #42
* Great Weapon Fighting no longer applied to heavy ranged weapons #41
* fixed crashes with 'Firebase.update failed' message #46
* performance improvements
* minor bug fixes

**For changes made in v0.2.7 - v0.3.10 [click here](https://github.com/sillvva/Roll20-API-Scripts/commits/master)**

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
