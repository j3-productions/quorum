# Single Ship Testing #

## Poke Tests ##

### Basic Tests ###

```
:forums &forums-poke [[our %board-name] %new-board [our %group-name] 'Title' 'Description' ~[%tag-1 %tag-2]]
:forums &forums-poke [[our %board-name] %new-thread 'Title #1' ~[%tag-1] 'Content']
:forums &forums-poke [[our %board-name] %new-thread 'Title #2' ~[%tag-2] 'Content']
:forums &forums-poke [[our %board-name] %new-reply 1 'Reply #1' %|]
:forums &forums-poke [[our %board-name] %new-reply 2 'Reply #2' %|]
:forums &forums-poke [[our %board-name] %new-reply 1 'Comment #1' %&]
:forums &forums-poke [[our %board-name] %new-reply 1 'Comment #2' %&]
:forums &forums-poke [[our %board-name] %edit-post 2 'Edited Content']
:forums &forums-poke [[our %board-name] %edit-post 2 'Re-edited Content']
:forums &forums-poke [[our %board-name] %edit-post 5 'Edited Reply']
:forums &forums-poke [[our %board-name] %edit-post 5 'Re-edited Comment']
:forums &forums-poke [[our %board-name] %vote 1 %up]
:forums &forums-poke [[our %board-name] %vote 2 %down]
:forums &forums-poke [[our %board-name] %vote 1 %down]
:forums &forums-poke [[our %board-name] %vote 2 %down]
:forums &forums-poke [[our %board-name] %edit-board `'Edit Name' `'Edit Description' `~[%etag-1]]
:forums &forums-poke [[our %board-name] %edit-thread 1 `3 `'Edit Title' `~[%etag-1]]
:forums &forums-poke [[our %board-name] %delete-post 6]
:forums &forums-poke [[our %bored-name] %new-board [our %group-lame] 'Fifle' 'Prescription' ~]
:forums &forums-poke [[our %bored-name] %new-thread 'Rifle #1' ~[%bag-1] 'Content']
```

### Deletion Tests ###

Only run these commands after running all of the basic test commands.

```
:forums &forums-poke [[our %board-name] %delete-post 1]
:forums &forums-poke [[our %board-name] %delete-board ~]
```

### Error Tests ###

Only run these commands after running all of the basic test commands.

```
:forums &forums-poke [[our %board-name] %new-reply 1 'Bad Reply #2' %|]
:forums &forums-poke [[our %board-name] %edit-thread 1 ~ ~ `~[%tag-2]]
:forums &forums-poke [[our %board-name] %new-reply 10 'Bad Reply #3' %|]
:forums &forums-poke [[our %board-name] %new-reply 10 'Bad Comment #3' %&]
:forums &forums-poke [[our %board-name] %edit-thread 1 `10 ~ ~]
```

## Scry Tests ##

Run these commands after running some number of setup commands (e.g. the basic
test commands).

### Raw Noun Tests ###

```
=f -build-file /=forums=/sur/forums/hoon
.^((list metadata:f) %gx /=forums=/boards/noun)
.^(page:f %gx /=forums=/search/0/(scot %t 'comment')/noun)
.^(page:f %gx /=forums=/search/0/(scot %t 'tag:etag-1')/noun)
.^(page:f %gx /=forums=/search/0/(scot %t 'author:~zod')/noun)
.^(page:f %gx /=forums=/search/0/(scot %t 'e tag:etag-1  author:~zod')/noun)
.^(metadata:f %gx /=forums=/board/(scot %p our)/board-name/metadata/noun)
.^(page:f %gx /=forums=/board/(scot %p our)/board-name/questions/0/noun)
.^(page:f %gx /=forums=/board/(scot %p our)/board-name/search/0/(scot %t %reply)/noun)
.^(thread:f %gx /=forums=/board/(scot %p our)/board-name/thread/1/noun)
```

### JSON Tests ###

```
.^(json %gx /=forums=/boards/json)
.^(json %gx /=forums=/search/0/(scot %t %comment)/json)
.^(json %gx /=forums=/board/(scot %p our)/board-name/metadata/json)
.^(json %gx /=forums=/board/(scot %p our)/board-name/questions/0/json)
.^(json %gx /=forums=/board/(scot %p our)/board-name/search/0/(scot %t %reply)/json)
.^(json %gx /=forums=/board/(scot %p our)/board-name/thread/1/json)
```

## Mark Tests ##

### `&surf-boards` Mark ###

```
=f -build-file /=forums=/sur/forums/hoon
=j2s -build-tube /=forums=/json/surf-boards
=j2sg |=(t=@t !<(surf-boards:f (j2s !>((need (de-json:html t))))))
(j2sg '["~zod", "forums", "updates", "~zod", "board-name", null]')
(j2sg '["~sampel-palnet", "forums", "updates", "~sampel-palnet", "weird---name----technically-ok", null]')
```

### `&forums-poke` Mark ###

```
=f -build-file /=forums=/sur/forums/hoon
=j2a -build-tube /=forums=/json/forums-poke
=j2ag |=(t=@t !<(forums-poke:f (j2a !>((need (de:json:html t))))))
(j2ag '{"board": "~zod/b", "action": {"new-board": {"group": "~zod/g", "title": "t", "description": "d", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "action": {"new-board": {"group": "~zod/g", "title": "t", "description": "d", "tags": []}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-board": {"title": "t"}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-board": {"title": "t", "description": "d", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "action": {"delete-board": null}}')
(j2ag '{"board": "~zod/b", "action": {"edit-thread": {"post-id": 1}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-thread": {"post-id": 1, "best-id": 1}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-thread": {"post-id": 1, "title": "t"}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-thread": {"post-id": 1, "title": "t", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-thread": {"post-id": 1, "best-id": 1, "title": "t", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "action": {"new-thread": {"title": "t", "content": "c", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "action": {"new-reply": {"parent-id": 1, "content": "c", "is-comment": true}}}')
(j2ag '{"board": "~zod/b", "action": {"edit-post": {"post-id": 1, "content": "c"}}}')
(j2ag '{"board": "~zod/b", "action": {"delete-post": {"post-id": 1}}}')
(j2ag '{"board": "~zod/b", "action": {"vote": {"post-id": 1, "dir": "up"}}}')
(j2ag '{"board": "~zod/b", "action": {"vote": {"post-id": 1, "dir": "down"}}}')
```

```
=f -build-file /=forums=/sur/forums/hoon
=a2j -build-tube /=forums=/forums-poke/json
=a2jg |=(a=forums-poke:f (en:json:html !<(json (a2j !>(a)))))
(a2jg [[our %b] %new-board [our %g] 't' 'd' ~[%x %y]])
(a2jg [[our %b] %new-board [our %g] 't' 'd' ~])
(a2jg [[our %b] %edit-board `'t' ~ ~])
(a2jg [[our %b] %edit-board `'t' `'d' `~[%x %y]])
(a2jg [[our %b] %delete-board ~])
(a2jg [[our %b] %edit-thread 1 ~ ~ ~])
(a2jg [[our %b] %edit-thread 1 `2 ~ ~])
(a2jg [[our %b] %edit-thread 1 ~ `'t' ~])
(a2jg [[our %b] %edit-thread 1 ~ `'t' `~[%x %y]])
(a2jg [[our %b] %edit-thread 1 `2 `'t' `~[%x %y]])
(a2jg [[our %b] %new-thread 't' ~[%x %y] 'c'])
(a2jg [[our %b] %new-reply 1 'c' %&])
(a2jg [[our %b] %edit-post 1 'c'])
(a2jg [[our %b] %delete-post 1])
(a2jg [[our %b] %vote 1 %up])
(a2jg [[our %b] %vote 1 %down])
```

### `&forums-update` Marks ###

The following tests are largely made redundant by the scry JSON tests above,
but are included to enable more careful individual debugging of individual
mark files.

```
=f -build-file /=forums=/sur/forums/hoon
=m2j -build-tube /=forums=/forums-metadata/json
!<(json (m2j !>(*metadata:f)))
=n2j -build-tube /=forums=/forums-metadatas/json
!<(json (n2j !>(`(list metadata:f)`~[*metadata:f])))
=p2j -build-tube /=forums=/forums-page/json
!<(json (p2j !>([`(list post:f)`~[*post:f] 0])))
=t2j -build-tube /=forums=/forums-thread/json
!<(json (t2j !>([*post:f `(list post:f)`~[*post:f]])))
```

# Multiple Ship Testing #

Run the basic test commands on a fake `~zod` ship, then run the following on
a different ship:

```
:forums &surf-boards [~zod %forums %updates ~zod %board-name ~]
```
