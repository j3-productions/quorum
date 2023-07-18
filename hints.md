# Single Ship Testing #

## Poke Tests ##

### Basic Tests ###

```
:groups &group-create [%test-group (crip "{<our>} pub") (crip "{<our>} pub") 'https://picsum.photos/200' 'https://picsum.photos/200' [%open ~ ~] ~ %.n]
:groups &group-create [%test-group-2 (crip "{<our>} pri") (crip "{<our>} pri") '#0000ff' '#0000ff' [%shut ~ ~] *(jug ship term) %.n]
:groups &group-join [[`@p`+(our) %test-group] %.y]

:quorum &quorum-create [[our %test-group] %test-board 'Title' 'Desc' ~ ~]
:quorum &quorum-action [[our %test-board] %new-thread 'Title #1' ~[%tag-1] 'Content']
:quorum &quorum-action [[our %test-board] %new-thread 'Title #2' ~[%tag-2] 'Content']
:quorum &quorum-action [[our %test-board] %new-thread 'Title #3' ~[%tag-3] 'Content']
:quorum &quorum-action [[our %test-board] %new-reply 1 'Reply #1' %|]
:quorum &quorum-action [[our %test-board] %new-reply 2 'Reply #2' %|]
:quorum &quorum-action [[our %test-board] %new-reply 3 'Reply #3' %|]
:quorum &quorum-action [[our %test-board] %edit-post 2 'Edited Content']
:quorum &quorum-action [[our %test-board] %edit-post 2 'Re-edited Content']
:quorum &quorum-action [[our %test-board] %edit-post 5 'Edited Reply']
:quorum &quorum-action [[our %test-board] %edit-post 5 'Re-edited Reply']
:quorum &quorum-action [[our %test-board] %vote 1 %up]
:quorum &quorum-action [[our %test-board] %vote 2 %down]
:quorum &quorum-action [[our %test-board] %vote 1 %down]
:quorum &quorum-action [[our %test-board] %vote 2 %down]
:quorum &quorum-action [[our %test-board] %edit-board `'Edit Name' `'Edit Description' `~[%etag-1]]
:quorum &quorum-action [[our %test-board] %edit-thread 1 `4 `'Edit Title' `~[%etag-1]]
:quorum &quorum-action [[our %test-board] %delete-post 3]
:quorum &quorum-create [[our %test-group-2] %test-board-2 'Title2' 'Desc2' (silt `(list term)`~[%admin %members]) (silt `(list term)`~[%admin])]
:quorum &quorum-action [[our %test-board-2] %new-thread 'Rifle #1' ~[%bag-1] 'Content']
:quorum &quorum-action [[our %test-board-2] %add-sects ~[%secret-1 %secret-2]]
:quorum &quorum-action [[our %test-board-2] %del-sects ~[%secret-2]]
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
:quorum &quorum-action [[our %test-board] %new-reply 1 'Comment' %&]
:quorum &quorum-action [[our %test-board] %new-reply 1 'Bad Reply #2' %|]
:quorum &quorum-action [[our %test-board] %edit-thread 1 ~ ~ `~[%tag-2]]
:quorum &quorum-action [[our %test-board] %new-reply 10 'Bad Reply #3' %|]
:quorum &quorum-action [[our %test-board] %edit-thread 1 `10 ~ ~]
```

### Permissions Tests ###

Only run these commands after running all of the basic test commands.

```
>> ~nec
:groups &group-create [%perm-group (crip "{<our>} perms") '' '#aa0000' '#aa0000' [%open ~ ~] (~(gas ju *(jug ship term)) ~[[our %admin] [~zod %watcher]]) %.n]
:groups &group-action-1 [[our %perm-group] now %cabal %watcher %add ['Watcher' 'Watches' '' '']]
:quorum &quorum-create [[our %perm-group] %perm-board 'Perm Board' '' (silt `(list term)`~[%admin %watcher]) (silt `(list term)`~[%admin])]
:quorum &quorum-action [[our %perm-board] %new-thread '#1' ~ 'Content #1']
:quorum &quorum-action [[our %perm-board] %new-thread '#2' ~ 'Content #2']
:quorum &quorum-action [[our %perm-board] %new-reply 1 'Reply #1' %|]
:quorum &quorum-action [[our %perm-board] %vote 1 %up]
:quorum &quorum-action [[our %perm-board] %vote 2 %up]
:quorum &quorum-action [[our %perm-board] %vote 3 %down]
:quorum &quorum-action [[our %perm-board] %edit-thread 1 `3 ~ ~]
>> ~zod
:groups &group-join [[~nec %perm-group] %.y]
>> ~nec
:groups &group-action-1 [[our %perm-group] now %fleet (~(gas in *(set ship)) ~[~zod]) %add-sects (~(gas in *(set term)) ~[%admin])]
:groups &group-action-1 [[our %perm-group] now %fleet (~(gas in *(set ship)) ~[~zod]) %del-sects (~(gas in *(set term)) ~[%admin])]
:groups &group-action-1 [[our %perm-group] now %cordon %open %add-ships (~(gas in *(set ship)) ~[~zod])]
:groups &group-action-1 [[our %perm-group] now %cordon %open %del-ships (~(gas in *(set ship)) ~[~zod])]
:groups &group-action-1 [[our %perm-group] now %fleet (~(gas in *(set ship)) ~[~zod]) %add-sects (~(gas in *(set term)) ~[%watcher])]
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
.^(perm:q %gx /=quorum=/board/(scot %p our)/test-board/perm/noun)
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
.^(json %gx /=quorum=/board/(scot %p our)/test-board/perm/json)
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
(j2ag '{"board": "~zod/b", "update": {"add-sects": {"sects": ["test"]}}}')
(j2ag '{"board": "~zod/b", "update": {"del-sects": {"sects": ["test"]}}}')
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
(a2jg [[our %b] %add-sects ~[%a %b]])
(a2jg [[our %b] %del-sects ~[%a %b]])
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
=p2j -build-tube /=quorum=/quorum-perm/json
=p2jg |=(p=perm:q (en:json:html !<(json (p2j !>(p)))))
(p2jg [(silt `(list term)`~[%admin %members]) [~zod 'group']])
=j2r -build-tube /=quorum=/json/quorum-remark-action
=j2rg |=(t=@t !<(remark-action:q (j2r !>((need (de:json:html t))))))
(j2rg '{"flag": "~zod/channel", "diff": {"read": null}}')
(j2rg '{"flag": "~zod/channel", "diff": {"watch": null}}')
=r2j -build-tube /=quorum=/quorum-remark-action/json
=r2jg |=(r=remark-action:q (en:json:html !<(json (r2j !>(r)))))
(r2jg [[~zod 'channel'] [%read ~]])
(r2jg [[~zod 'channel'] [%watch ~]])
```

# Multiple Ship Testing #

Run the basic test commands on a fake `~nec` ship, then run the following on
a different ship:

## Poke Tests ##

### Basic Tests ###

Because of `%groups` channel auto-joining, the easiest way to test multiplayer
joining from the FE is to:

1. Run the group creation commands on `~zod` and `~nec`
2. Join the `~nec` test group on `~zod`
3. Run the first test channel creation command on `~nec`, which will be
   auto-joined on `~zod`
4. Run the leave command on `~zod`, i.e.:
   `:quorum &quorum-leave [~nec %test-board]`
5. Run the join command from the FE by using the join dialog

```
:quorum &channel-join [[~nec %test-group] [~nec %test-board]]
:quorum &quorum-action [[~nec %test-board] %vote 1 %up]
:quorum &quorum-leave [~nec %test-board]
```

### Error Tests ###

```
:quorum &channel-join [[~nec %test-group-2] [~nec %test-board-2]]
:quorum &quorum-action [[~nec %error-board] %new-board [~nec %test-group] ~ 'Error' '' ~]
:quorum &quorum-action [[~nec %test-board] %edit-board `'Error' ~ ~]
:quorum &quorum-action [[~nec %test-board] %edit-post 1 'Error']
:quorum &quorum-action [[~nec %test-board] %edit-thread 1 ~ `'Error' ~]
:quorum &quorum-action [[~nec %test-board] %delete-post 1]
```
