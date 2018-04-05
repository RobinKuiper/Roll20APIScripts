# Roll20 API Scripts

Skype: RobinKuiper.eu
Discord: Atheos#1014
Roll20: https://app.roll20.net/users/1226016/robin-k

### StatusInfo

StatusInfo works nicely together with [Tokenmod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825).
It shows condition descriptions whenever a statusmarker is set or when the command `!condition` is used, eg: `!condition prone`.

![Prone Description](https://i.imgur.com/NhASVq0.png "Prone Description")

It uses the following condition/statusmarker list:

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
!token-mod ?{Status|Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Concentrating, --set statusmarkers#!blue|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|Dead, --set statusmarkers#!dead|Clear, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask}
```