# Roll20 API Scripts

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Reddit: https://www.reddit.com/user/robinkuiper/

---

**Table of Contents**
* [BeyondImporter](#beyondimporter)
* [LazyExperience](#lazyexperience)
* [StatusInfo](#statusinfo)

---

## BeyondImporter

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

## LazyExperience

LazyExperience is a script to record experience during a game (the idea comes from [EasyExperience](https://app.roll20.net/forum/post/3309609/script-easy-experience/?pageforid=3506293#post-3506293)).
Biggest difference is that it has an option to reward experience directly, and keeps track on statusmarker changes on tokens.

### Config

The first time you add this script you get a first time config menu in chat.

![Config Menu](https://i.imgur.com/sx8JMgU.png "Config Menu")

* **Command** - The command you want to use with this script, eg. !xp.
* **Marker** - The "dead" marker you want to use to give an option to reward experience when something dies.
* **Player XP Attribute** - The player's experience attribute in the sheet you are using, this is defaulted to the 5e OGL sheet (experience).
* **NPC XP Attribute** - The npc's experience attribute in the sheet you are using, this is defaulted to the 5e OGL sheet (npc_xp).
* **Extra Players** - This can be used to add to the experience divisors (eg. for npc under no one's control, etc).
* **Give XP Instant** - If you want to instantly give experience to the players when you reward it, otherwise it will be rewarded at the end of the session.
* **Update Sheets** - If you want to update the characters sheets when experience is rewarded.
* **Refresh Players** - Refresh the player list (eg. when a new player joins or someone leaves).
* **Reset Experience** - Resets the experience back to 0.
* **Reset Config** - Resets the config options to default.

#### Player Config
![Player Config](https://i.imgur.com/1ldnSc2.png "Player Config")

* **Active Toggles** - Sets the player/character active (or not). A player/character who is not active will not be rewarded xp at the end of the session and will not be in the LazyExperience menu list.
* **Add Experience** - Reward experience to (one of) the player's character(s).
* **Back** - Back to the config menu.
* **Remove** - Removes the player entirely from the LazyExperience config.

### Commands

* **!xp help** - Shows the help menu.
* **!xp config** - Shows the config menu.
* **!xp menu** - Shows the LazyExperience menu (more below).
* **!xp add session [XP]** - Adds (or gives if you want to give instantly) experience to the session experience threshold, where [XP] is the amount of experience.
* **!xp add [characterid] [XP]** - Adds (or gives if you want to give instantly) experience to the character experience threshold, where [characterid] is the character's id and [XP] is the amount of experience.
* **!xp end** - Ends the session, reset experience, and rewards experience to the players (if you didn't reward it instantly).

#### LazyExperience Menu
![Menu](https://i.imgur.com/2EwXsCf.png "Menu")

This menu shows the current experience in the session threshold. It also show the amount it will be divised with when rewarded.
A list of active players with there active characters is also shown here, and experience can be rewarded.

#### Statusmarker Dead
![Dead](https://i.imgur.com/5bpZgHj.png "Dead")

When a token is given the statusmarker you have set up in the config ("dead" by default), you will get the question if you want to add the experience to the session experience threshold.

Roll20 Thread: https://app.roll20.net/forum/post/6275681/script-lazyexperience/?pageforid=6275681#post-6275681

---

## StatusInfo

StatusInfo works nicely together with [Tokenmod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825).
It shows condition descriptions whenever a statusmarker is set or when the command `!condition` is used, eg: `!condition prone`.

![Prone Description](https://i.imgur.com/UpBHjVh.png "Prone Description")

### Commands

* **!condition help** - Shows the help menu.
* **!condition config** - Shows the config menu.
* **!condition [CONDITION NAME]** - Shows the description of the condition entered.

It uses the following condition/statusmarker list by default (but you can always change this in the code):

* Blinded, bleeding-eye
* Charmed, broken-heart
* Deafened, edge-crack
* Frightened, screaming
* Grappled, grab
* Invisibility, ninja-mask
* Incapacitated, interdiction
* Paralyzed, pummeled
* Petrified, frozen-orb
* Poisoned, chemical-bolt
* Prone, back-pain
* Restrained, fishing-net
* Stunned, fist
* Unconscious, sleepy

I run this with the following Tokenmod macro:

```
!token-mod ?{Status|Concentrating, --set statusmarkers#!blue|Readying, --set statusmarkers#!stopwatch|-, |Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|-, |Blessed, --set statusmarkers#!angel-outfit|Raging, --set statusmarkers#!overdrive|Marked, --set statusmarkers#!archery-target|-, |Dead, --set statusmarkers#=dead|-, |Clear Conditions, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-dead|Clear All, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-angel-outfit#-overdrive#-blue#-stopwatch#-archery-target#-dead}
```

Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo