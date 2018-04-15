## Macros

This are some of the macros I use in my games. I use some more, but they are using rolltables (or just not interesting enough to put here).

### General
**Initiative**
``` 
Initiative [[1d20 + @{selected|dexterity_mod}&{tracker}]] 
```

**Travel Time**
``` 
**It will take [[ ?{How far in miles?|24} / (?{Travel Pace?|Fast, 30|Normal, 24|Slow, 18|Normal Jungle, 20} * ?{Travel Mode?|On Foot, 1|Horseback, 1.25|Wyvern - 9 hours, 3|Broom - 13 hours, 3|Flying Speed 30 - 4 MPH, 4} * ?{Terrain?|Road/Trails, 1|Off Road, 0.5|Air, 1|Jungle, 0.5})  ]] day(s) to travel [[ ?{How far in miles?} ]] miles.** 
```

### [LazyExperience](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/LazyExperience)
**Add Session XP**
``` 
!xp add session ?{Experience} 
```

**Add monster XP to Session XP**
``` 
!xp add session @{selected|npc_xp}
```

**Give experience to selected character**
``` 
!xp add @{selected|character_id} ?{Experience} 
```

### [TurnMarker1](https://app.roll20.net/forum/post/931415/script-turnmarker1-turn-token-highlight-round-counter-player-advance-command-turn-announce-plus-spiny-graphics-if-you-want-them/?pageforid=931415#post-931415) & [GroupInitiative](https://wiki.roll20.net/Script:Group_Initiative)
**Start Combat**
```
!group-init
!group-init --sort
```

**End Combat**
```
!group-init --clear
!tm reset
```

### [TokenMod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825)
**Light**
``` 
!token-mod --set ?{Vision|Torch, light_radius#40 light_dimradius#20 light_hassight#yes light_angle#360 light_otherplayers#yes|Hooded Lantern, light_radius#60 light_dimradius#30 light_hassight#yes light_angle#360 light_otherplayers#yes|Bullseye Lantern, light_radius#120 light_dimradius#60 light_angle#60 light_hassight#yes light_otherplayers#yes|Lamp, light_radius#30 light_dimradius#15 light_hassight#yes light_angle#360 light_otherplayers#yes|Candle, light_radius#5 light_dimradius#=0 light_hassight#yes light_angle#360 light_otherplayers#yes|Darkvision, light_radius#60 light_dimradius#=-5 light_hassight#yes light_angle#360 light_otherplayers#no|Darkvision (90'), light_radius#90 light_dimradius#=-5 light_hassight#yes light_angle#360 light_otherplayers#no|Warlock Devil's Sight, light_radius#120 light_dimradius#=120 light_hassight#yes light_angle#360 light_otherplayers#no|No light source(Dusk), light_radius#120 light_dimradius#=-5 light_hassight#yes light_angle#360 light_otherplayers#no|Fog, light_radius#200 light_dimradius#=5 light_hassight#yes light_angle#360 light_otherplayers#no|No light source, light_radius#5 light_dimradius#=-5 light_hassight#yes light_angle#360 light_otherplayers#no|Blinded, light_hassight#no light_angle#360 light_otherplayers#no} 
```

**Random HP**
``` 
!token-mod --set bar1|[[@{selected|npc_hpformula}]] 
```

**Status**
``` 
!token-mod ?{Status|Concentrating, --set statusmarkers#!stopwatch|Readying, --set statusmarkers#!stopwatch|-, |Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|-, |Blessed, --set statusmarkers#!angel-outfit|Raging, --set statusmarkers#!overdrive|Marked, --set statusmarkers#!archery-target|-, |Dead, --set statusmarkers#=dead|-, |Clear Conditions, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-dead|Clear All, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-angel-outfit#-overdrive#-blue#-stopwatch#-archery-target#-dead} 
```
