## BeyondImporter

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* My Discord Server: https://discord.gg/AcC9VME
* Roll20: https://app.roll20.net/users/1226016/robin
* Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

```
NOTICE: I will not update this for now. Probably going to update it when we have a good and steady version for 5eOGL.
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
In the Roll20 chat type the command `!beyond import` and paste the copied contents after that, eg:

```
!beyond import {"character":{"id":1307201,"name":"Qroohk","player":"Atheos","age":null,"hair":null,"eyes":null,"skin":null,"height":null,"weight":null,"size":"Medium","alignment":"Lawful Good" ..........
```

Your character will be imported now!

### Commands

* **!beyond help** - Shows the help menu.
* **!beyond config** - Shows the config menu.
* **!beyond import [CHARACTER JSON]** - Imports a character from the DNDBeyond json.

![Config Menu](https://i.imgur.com/WLb76Uy.png "Config Menu")

Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets

--- 

#### Changelog:

**v0.0.7**
* Import of subclass features.
* Fixed HP Calculations.

**v0.0.6**
* Background description shows in backstory field now.
* Background features added.
* Racial Traits added.
* Background features added. Fixed some skill proficiencies