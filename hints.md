# Single Ship Testing #

## Poke Tests ##

### Basic Tests ###

```
:groups &group-create [%test-group (crip "{<our>} Public") (crip "{<our>} pub") 'https://picsum.photos/200' 'https://picsum.photos/200' [%open *(set ship) *(set rank:title)] *(jug ship term) %.n]
:groups &group-create [%test-group-2 (crip "{<our>} Private") (crip "{<our>} pri") 'https://picsum.photos/200' 'https://picsum.photos/200' [%shut *(set ship) *(set ship)] *(jug ship term) %.n]
:chat &chat-create [[our %test-group] %test-chat (crip "{<our>} Chat") '' (silt `(list term)`~[%admin %members]) (silt `(list term)`~[%admin])]
:groups &group-join [[`@p`+(our) %test-group] %.y]

:quorum &quorum-create [[our %test-group] %test-board 'Title' 'Desc' (silt `(list term)`~[%admin %members]) (silt `(list term)`~[%admin])]
:quorum &quorum-action [[our %test-board] %new-thread 'Title #1' ~[%tag-1] 'Content']
:quorum &quorum-action [[our %test-board] %new-thread 'Title #2' ~[%tag-2] 'Content']
:quorum &quorum-action [[our %test-board] %new-reply 1 'Reply #1' %|]
:quorum &quorum-action [[our %test-board] %new-reply 2 'Reply #2' %|]
:quorum &quorum-action [[our %test-board] %new-reply 1 'Comment #1' %&]
:quorum &quorum-action [[our %test-board] %new-reply 1 'Comment #2' %&]
:quorum &quorum-action [[our %test-board] %edit-post 2 'Edited Content']
:quorum &quorum-action [[our %test-board] %edit-post 2 'Re-edited Content']
:quorum &quorum-action [[our %test-board] %edit-post 4 'Edited Reply']
:quorum &quorum-action [[our %test-board] %edit-post 4 'Re-edited Reply']
:quorum &quorum-action [[our %test-board] %vote 1 %up]
:quorum &quorum-action [[our %test-board] %vote 2 %down]
:quorum &quorum-action [[our %test-board] %vote 1 %down]
:quorum &quorum-action [[our %test-board] %vote 2 %down]
:quorum &quorum-action [[our %test-board] %edit-board `'Edit Name' `'Edit Description' `~[%etag-1]]
:quorum &quorum-action [[our %test-board] %edit-thread 1 `3 `'Edit Title' `~[%etag-1]]
:quorum &quorum-action [[our %test-board] %delete-post 6]
:quorum &quorum-action [[our %test-board-2] %new-board [our %test-group-2] ~ 'Fifle' 'Prescription' ~]
:quorum &quorum-action [[our %test-board-2] %new-thread 'Rifle #1' ~[%bag-1] 'Content']
```

### Deletion Tests ###

Only run these commands after running all of the basic test commands.

```
:quorum &quorum-action [[our %test-board] %delete-post 1]
:quorum &quorum-action [[our %test-board] %delete-board ~]
```

### Error Tests ###

Only run these commands after running all of the basic test commands.

```
:quorum &quorum-action [[our %test-board] %new-reply 1 'Bad Reply #2' %|]
:quorum &quorum-action [[our %test-board] %edit-thread 1 ~ ~ `~[%tag-2]]
:quorum &quorum-action [[our %test-board] %new-reply 10 'Bad Reply #3' %|]
:quorum &quorum-action [[our %test-board] %new-reply 10 'Bad Comment #3' %&]
:quorum &quorum-action [[our %test-board] %edit-thread 1 `10 ~ ~]
```

## Scry Tests ##

Run these commands after running some number of setup commands (e.g. the basic
test commands).

### Raw Noun Tests ###

```
=q -build-file /=quorum=/sur/quorum/hoon
.^((list metadata:q) %gx /=quorum=/boards/noun)
.^(page:q %gx /=quorum=/search/0/(scot %t 'comment')/noun)
.^(page:q %gx /=quorum=/search/0/(scot %t 'tag:etag-1')/noun)
.^(page:q %gx /=quorum=/search/0/(scot %t 'author:~zod')/noun)
.^(page:q %gx /=quorum=/search/0/(scot %t 'e tag:etag-1  author:~zod')/noun)
.^(metadata:q %gx /=quorum=/board/(scot %p our)/test-board/metadata/noun)
.^(page:q %gx /=quorum=/board/(scot %p our)/test-board/questions/0/noun)
.^(page:q %gx /=quorum=/board/(scot %p our)/test-board/search/0/(scot %t %reply)/noun)
.^(thread:q %gx /=quorum=/board/(scot %p our)/test-board/thread/1/noun)
.^(briefs:q %gx /=quorum=/briefs/noun)
```

### JSON Tests ###

```
.^(json %gx /=quorum=/boards/json)
.^(json %gx /=quorum=/search/0/(scot %t %comment)/json)
.^(json %gx /=quorum=/board/(scot %p our)/test-board/metadata/json)
.^(json %gx /=quorum=/board/(scot %p our)/test-board/questions/0/json)
.^(json %gx /=quorum=/board/(scot %p our)/test-board/search/0/(scot %t %reply)/json)
.^(json %gx /=quorum=/board/(scot %p our)/test-board/thread/1/json)
.^(json %gx /=quorum=/briefs/json)
```

## Mark Tests ##

### `&quorum-action` Mark ###

```
=q -build-file /=quorum=/sur/quorum/hoon
=j2a -build-tube /=quorum=/json/quorum-action
=j2ag |=(t=@t !<(action:q (j2a !>((need (de:json:html t))))))
(j2ag '{"board": "~zod/b", "update": {"new-board": {"group": "~zod/g", "writers": ["admin"], "title": "t", "description": "d", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "update": {"new-board": {"group": "~zod/g", "writers": [], "title": "t", "description": "d", "tags": []}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-board": {"title": "t"}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-board": {"title": "t", "description": "d", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "update": {"delete-board": null}}')
(j2ag '{"board": "~zod/b", "update": {"edit-thread": {"post-id": 1}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-thread": {"post-id": 1, "best-id": 1}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-thread": {"post-id": 1, "title": "t"}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-thread": {"post-id": 1, "title": "t", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-thread": {"post-id": 1, "best-id": 1, "title": "t", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "update": {"new-thread": {"title": "t", "content": "c", "tags": ["x", "y"]}}}')
(j2ag '{"board": "~zod/b", "update": {"new-reply": {"parent-id": 1, "content": "c", "is-comment": true}}}')
(j2ag '{"board": "~zod/b", "update": {"edit-post": {"post-id": 1, "content": "c"}}}')
(j2ag '{"board": "~zod/b", "update": {"delete-post": {"post-id": 1}}}')
(j2ag '{"board": "~zod/b", "update": {"vote": {"post-id": 1, "dir": "up"}}}')
(j2ag '{"board": "~zod/b", "update": {"vote": {"post-id": 1, "dir": "down"}}}')
```

```
=q -build-file /=quorum=/sur/quorum/hoon
=a2j -build-tube /=quorum=/quorum-action/json
=a2jg |=(a=action:q (en:json:html !<(json (a2j !>(a)))))
(a2jg [[our %b] %new-board [our %g] ~[%a %b] 't' 'd' ~[%x %y]])
(a2jg [[our %b] %new-board [our %g] ~ 't' 'd' ~])
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

### `&surf-boards` Mark ###

```
=q -build-file /=quorum=/sur/quorum/hoon
=j2s -build-tube /=quorum=/json/surf-boards
=j2sg |=(t=@t !<(surf-boards:q (j2s !>((need (de-json:html t))))))
(j2sg '["~zod", "quorum", "updates", "~zod", "test-board", null]')
(j2sg '["~sampel-palnet", "quorum", "updates", "~sampel-palnet", "weird---name----technically-ok", null]')
```

### `&quorum-update` Marks ###

The following tests are largely made redundant by the scry JSON tests above,
but are included to enable more careful individual debugging of individual
mark files.

```
=q -build-file /=quorum=/sur/quorum/hoon
=m2j -build-tube /=quorum=/quorum-metadata/json
!<(json (m2j !>(*metadata:q)))
=n2j -build-tube /=quorum=/quorum-metadatas/json
!<(json (n2j !>(`(list metadata:q)`~[*metadata:q])))
=p2j -build-tube /=quorum=/quorum-page/json
!<(json (p2j !>([`(list post:q)`~[*post:q] 0])))
=t2j -build-tube /=quorum=/quorum-thread/json
!<(json (t2j !>([*post:q `(list post:q)`~[*post:q]])))
```

### `&channel-*` Marks ###

```
=q -build-file /=quorum=/sur/quorum/hoon
=j2c -build-tube /=quorum=/json/channel-join
=j2cg |=(t=@t !<(join:q (j2c !>((need (de:json:html t))))))
(j2cg '{"group": "~zod/group", "chan": "~zod/channel"}')
=c2j -build-tube /=quorum=/channel-join/json
=c2jg |=(j=join:q (en:json:html !<(json (c2j !>(j)))))
(c2jg [[~zod 'group'] [~zod 'channel']])
=j2l -build-tube /=quorum=/json/quorum-leave
=j2lg |=(t=@t !<(flag:q (j2l !>((need (de:json:html t))))))
(j2lg '"~zod/channel"')
=l2j -build-tube /=quorum=/quorum-leave/json
=l2jg |=(l=flag:q (en:json:html !<(json (l2j !>(l)))))
(l2jg [~zod 'channel'])
=j2r -build-tube /=quorum=/json/quorum-create
=j2rg |=(t=@t !<(create:q (j2r !>((need (de:json:html t))))))
(j2rg '{"group": "~zod/group", "name": "n", "title": "t", "description": "d", "readers": ["r"], "writers": ["w"]}')
=b2j -build-tube /=quorum=/quorum-briefs/json
=b2jg |=(b=briefs:q (en:json:html !<(json (b2j !>(b)))))
(b2jg (~(gas by *briefs:q) `(list [flag:q brief:briefs:q])`~[[[~zod 'channel'] *brief:briefs:q]]))
=u2j -build-tube /=quorum=/quorum-brief-update/json
=u2jg |=(u=update:briefs:q (en:json:html !<(json (u2j !>(u)))))
(u2jg [[~zod 'channel'] *brief:briefs:q])
```

# Multiple Ship Testing #

Run the basic test commands on a fake `~nec` ship, then run the following on
a different ship:

## Poke Tests ##

### Basic Tests ###

```
:quorum &channel-join [[~nec %test-group] [~nec %test-board]]
:quorum &quorum-action [[~nec %test-board] %vote 1 %up]
:quorum &quorum-leave [~nec %test-board]
```

### Error Tests ###

```
:quorum &quorum-action [[~nec %error-board] %new-board [~nec %test-group] ~ 'Error' '' ~]
:quorum &quorum-action [[~nec %test-board] %edit-board `'Error' ~ ~]
:quorum &quorum-action [[~nec %test-board] %edit-post 1 'Error']
:quorum &quorum-action [[~nec %test-board] %edit-thread 1 ~ `'Error' ~]
:quorum &quorum-action [[~nec %test-board] %delete-post 1]
```
