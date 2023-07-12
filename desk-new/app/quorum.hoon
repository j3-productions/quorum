/-  boards, g=groups
/+  n=nectar, q=quorum, j=quorum-json
/+  verb, dbug
/+  *sss
/+  default-agent
^-  agent:gall
=>
  |%
  +$  card  card:agent:gall
  +$  state-0
    $:  %0
        our-boards=(map flag:q board:q)
        sub-boards=_(mk-subs boards ,[%quorum %updates @ @ ~])
        pub-boards=_(mk-pubs boards ,[%quorum %updates @ @ ~])
    ==
  +$  versioned-state
    $%  state-0
    ==
  ++  du-path  |=(=flag:q [%quorum %updates p.flag q.flag ~])
  ++  da-path  |=(=flag:q [p.flag %quorum [%quorum %updates p.flag q.flag ~]])
  ++  search
    |=([i=@ud p=(list post:q)] `page:q`(seek i p ~[[%score %&] [%act-date %&]]))
  ++  quest
    |=([i=@ud p=(list post:q)] `page:q`(seek i p ~[[%best %|] [%pub-date %&] [%score %&]]))
  ++  seek
    =/  flip  (flip:q 20)
    |=  [index=@ud posts=(list post:q) order=(lest spec:order:q)]
    ^-  page:q
    (flip index (sort:poast:q order posts))
  --
=|  state-0
=*  state  -
=<
  %+  verb  &
  %-  agent:dbug
  |_  =bowl:gall
  +*  this  .
      def   ~(. (default-agent this %|) bowl)
      cor   ~(. +> [bowl ~])
  ++  on-init
    ^-  (quip card _this)
    =^  cards  state
      abet:init:cor
    [cards this]
  ::
  ++  on-save  !>(state)
  ++  on-load
    |=  =vase
    ^-  (quip card _this)
    =^  cards  state
      abet:(load:cor vase)
    [cards this]
  ::
  ++  on-poke
    |=  [=mark =vase]
    ^-  (quip card _this)
    =^  cards  state
      abet:(poke:cor mark vase)
    [cards this]
  ++  on-watch
    |=  =path
    ^-  (quip card _this)
    =^  cards  state
      abet:(watch:cor path)
    [cards this]
  ::
  ++  on-peek   peek:cor
  ::
  ++  on-leave   on-leave:def
  ++  on-fail    on-fail:def
  ::
  ++  on-agent
    |=  [=wire =sign:agent:gall]
    ^-  (quip card _this)
    =^  cards  state
      abet:(agent:cor wire sign)
    [cards this]
  ::
  ++  on-arvo
    |=  [=wire sign=sign-arvo]
    ^-  (quip card _this)
    =^  cards  state
      abet:(arvo:cor wire sign)
    [cards this]
  --
|_  [=bowl:gall cards=(list card)]
::
+*  da-boards  =/  da  (da boards ,[%quorum %updates @ @ ~])
               (da sub-boards bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
    du-boards  =/  du  (du boards ,[%quorum %updates @ @ ~])
               (du pub-boards bowl -:!>(*result:du))
::
++  abet  [(flop cards) state]
++  cor   .
++  emit  |=(=card cor(cards [card cards]))
++  emil  |=(caz=(list card) cor(cards (welp (flop caz) cards)))
++  give  |=(=gift:agent:gall (emit %give gift))
++  pull  |=([caz=(list card) sub=_sub-boards] =.(sub-boards sub (emil caz)))
++  push  |=([caz=(list card) pub=_pub-boards] =.(pub-boards pub (emil caz)))
::
++  init
  ^+  cor
  ::  watch-groups
  cor
::
++  load
  |=  =vase
  ^+  cor
  =/  old  !<(versioned-state vase)
  %=    cor
      state
    ?-  -.old
      %0  old
    ==
  ==
::
++  poke
  |=  [=mark =vase]
  |^  ^+  cor
  ?+    mark  ~|(bad-poke/mark !!)
      %channel-join
    =+  !<(j=join:q vase)
    (join j)
  ::
      %quorum-leave
    =+  !<(l=leave:q vase)
    (leave l)
  ::
      %quorum-create
    =+  !<(req=create:q vase)
    (create req)
  ::
      %quorum-remark-action
    =+  !<(act=remark-action:q vase)
    bo-abet:(bo-remark-diff:(bo-abed:bo-core p.act) q.act)
  ::
      %quorum-action
    =+  !<(=action:q vase)
    ?>  (~(has by all-boards) p.action)
    =/  board-core  (bo-abed:bo-core p.action)
    ?:  =(p.p.action our.bowl)
      bo-abet:(bo-update:board-core q.action)
    bo-abet:(bo-proxy:board-core q.action)
  ::
      %surf-boards
    =+  !<([%quorum %updates ship=@p name=@tas ~] (slot 3 vase))
    (join [*flag:q [ship name]])
  ::
      %sss-on-rock
    ?-  msg=!<(from:da-boards (fled vase))
      [[%quorum *] *]  cor
    ==
  ::
      %quit-boards
    =+  !<([%quorum %updates ship=@p name=@tas ~] (slot 3 vase))
    (leave [ship name])
  ::
      %sss-to-pub
    ?-  msg=!<(into:du-boards (fled vase))
      [[%quorum *] *]  (push (apply:du-boards msg))
    ==
  ::
      %sss-boards
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  to avoid errors during delete actions.
    =/  res  !<(into:da-boards (fled vase))
    ::  TODO: Probably need to refactor this to do 'bo-*' stuff, esp.
    ::  rock.
    =?  cor  ?=(%scry type.res)
      %-  notify
      ?-  what.res
        %wave  act.wave.res
        %rock  =/  m=metadata:q  metadata.rock.res
               =,(m [board %new-board group.perm ~(tap in writers.perm) title description ~(tap in allowed-tags)])
      ==
    (pull (apply:da-boards res))
  ==
  ++  join
    |=  =join:q
    ^+  cor
    ?<  =(our.bowl p.chan.join)  :: cannot join board we host
    ?<  (~(has by all-boards) chan.join)
    bo-abet:(bo-join:bo-core join)
  ++  leave
    |=  =leave:q
    ?<  =(our.bowl p.leave)  :: cannot leave board we host
    ?>  (~(has by all-boards) leave)
    bo-abet:bo-leave:(bo-abed:bo-core leave)
  ++  create
    |=  req=create:q
    |^  ^+  cor
    ~_  leaf+"Create failed: check group permissions"
    ?>  can-nest
    ?>  ((sane %tas) name.req)
    =/  =flag:q  [our.bowl name.req]
    =.  our-boards  (~(put by our-boards) flag *board:q)
    bo-abet:(bo-init:(bo-abed:bo-core flag) req)
    ::  +can-nest: does group exist, are we allowed
    ::
    ++  can-nest
      ^-  ?
      =/  gop  (~(got by groups) group.req)
      %-  ~(any in bloc.gop)
      ~(has in sects:(~(got by fleet.gop) our.bowl))
    ::  +groups: all groups on this ship
    ::
    ++  groups
      .^  groups:g
        %gx
        /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/noun
      ==
    --
  --
::
++  watch
  |=  path=(pole knot)
  ^+  cor
  ?+    path  ~|(bad-watch-path/path !!)
      [?(%ui %briefs) ~]        ?>(from-self cor)
      [?(%meta %search) %ui ~]  ?>(from-self cor)
  ::
      [%quorum ship=@ name=@ path=*]
    =/  ship=@p    (slav %p ship.path)
    =/  name=term  (slav %tas name.path)
    bo-abet:(bo-watch:(bo-abed:bo-core ship name) path.path)
  ==
::
++  peek
  |=  path=(pole knot)
  ^-  (unit (unit cage))
  =/  all-boards=(map flag:q board:q)  all-boards
  ?+    path  [~ ~]
      [%x %boards ~]
    ``quorum-metadatas+!>((turn ~(val by all-boards) |=(b=board:q metadata.b)))
  ::
      [%x %briefs ~]
    =/  briefs=briefs:q
      %-  ~(gas by *briefs:q)
      %+  turn  ~(tap in ~(key by all-boards))
      |=(=flag:q [flag bo-brief:(bo-abed:bo-core flag)])
    ``quorum-briefs+!>(briefs)
  ::
      [%x %search index=@ query=@ ~]
    =/  index=@ud  (slav %ud index.path)
    =/  query=@t   (slav %t query.path)
    =/  posts=(list post:q)
      %-  zing
      %+  turn  ~(val by all-boards)
      |=(b=board:q (~(search via:q b) query))
    ``quorum-page+!>((search index posts))
  ::
      [%x %board ship=@ name=@ path=*]
    =/  ship=@p    (slav %p ship.path)
    =/  name=term  (slav %tas name.path)
    (bo-peek:(bo-abed:bo-core ship name) path.path)
  ==
::
++  agent
  |=  [=wire =sign:agent:gall]
  ^+  cor
  ?+    -.sign  cor
      %poke-ack
    ?~  p.sign  cor
    %-  (slog u.p.sign)
    ?+    wire  cor
        [~ %sss %scry-request @ @ @ %quorum %updates @ @ ~]
      (pull (tell:da-boards |3:wire sign))
    ==
  ==
::
++  arvo
  |=  [=wire sign=sign-arvo]
  ^+  cor
  ?+    wire  cor
      [~ %sss %behn @ @ @ %quorum %updates @ @ ~]
    (emil (behn:da-boards |3:wire))
  ==
::
++  give-brief
  |=  [=flag:q =brief:briefs:q]
  (give %fact ~[/briefs] quorum-brief-update+!>([flag brief]))
::
++  notify
  |=  act=action:q
  ^+  cor
  =-  (give %fact upd-paths %json !>((action:enjs:j act)))
  ^=  upd-paths
  ^-  (list path)
  =/  act-path=path  /quorum/(scot %p p.p.act)/(scot %tas q.p.act)
  ;:  welp
      ::  (/quorum/~ship/bord)?/search/ui: (global|board) search
      ~[/search/ui (welp act-path /search/ui)]
      ?+    -.q.act  ~
          ?(%new-board %edit-board %delete-board)
        ::  (/quorum/~ship/bord)?/meta/ui: (global|board) metadata
        ~[/meta/ui (welp act-path /meta/ui)]
      ::
          ?(%new-thread %edit-thread %new-reply %edit-post %delete-post %vote)
        =/  act-board=(unit board:q)  (~(get by all-boards) p.act)
        ?~  act-board  ~
        ::  /quorum/~ship/bord/thread/tid/ui: thread content
        =-  [(welp act-path /thread/(scot %ud post-id.-)/ui)]~
        ?+  -.q.act     (~(root via:q u.act-board) +<.q.act)
          %delete-post  (~(root via:q u.act-board) post-id.q.act)
          %new-reply    (~(root via:q u.act-board) parent-id.q.act)
          %new-thread   =+(p=*post:q p(post-id next-id.metadata.u.act-board))
        ==
      ==
  ==
::
++  from-self  =(our src):bowl
::
++  all-boards
  ^-  (map flag:q board:q)
  %-  ~(uni by our-boards)
  =/  da-tap=(list [* [? ? board:q]])  ~(tap by read:da-boards)
  =/  da-f2r  (turn da-tap |=([* [? ? =board:q]] [board.metadata.board board]))
  (malt `(list [flag:q board:q])`da-f2r)
::
++  bo-core
  |_  [=flag:q =board:q gone=_|]
  ++  bo-core  .
  ++  bo-abet
    ?:  !=(our.bowl p.flag)
      cor
    %_    cor
        our-boards
      ?:(gone (~(del by our-boards) flag) (~(put by our-boards) flag board))
    ==
    ::  TODO: If it's our board, push out 'kill' if it's gone and 'give'
    ::  if it isn't. (will need 'act' available; how can we construct this?
    ::  maybe just during relevant actions, e.g. init, join, leave?)
    ::  ?:  =(our.bowl p.flag)
    ::    %_    cor
    ::        our-boards
    ::      ?:(gone (~(del by our-boards) flag) (~(put by our-boards) flag board))
    ::    ==
    ::  =/  da-path  [p.flag %quorum [%quorum %updates p.flag q.flag ~]]
    ::  ?:(gone (pull ~ (quit:da-boards da-path)) (pull (surf:da-boards da-path)))
  ++  bo-abed
    |=  f=flag:q
    bo-core(flag f, board (~(got by all-boards) f))
  ++  bo-area  `path`/quorum/(scot %p p.flag)/[q.flag]  :: FIXME: Should be 'board'?
  ++  bo-du-path  [%quorum %updates p.flag q.flag ~]
  ++  bo-da-path  [p.flag %quorum %quorum %updates p.flag q.flag ~]
  ::
  ++  bo-groups-scry
    =*  group  group.perm.metadata.board
    /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/(scot %p p.group)/[q.group]
  ::
  ++  bo-can-write
    ?:  =(p.flag src.bowl)  &
    =/  =path
      %+  welp  bo-groups-scry
      /channel/[dap.bowl]/(scot %p p.flag)/[q.flag]/can-write/(scot %p src.bowl)/noun
    =+  .^(write=(unit [bloc=? sects=(set sect:g)]) %gx path)
    ?~  write  |
    =/  perms  (need write)
    ?:  |(bloc.perms =(~ writers.perm.metadata.board))  &
    !=(~ (~(int in writers.perm.metadata.board) sects.perms))
  ::
  ++  bo-can-read
    |=  her=ship
    =/  =path
      %+  welp  bo-groups-scry
      /channel/[dap.bowl]/(scot %p p.flag)/[q.flag]/can-read/(scot %p her)/loob
    .^(? %gx path)
  ::
  ++  bo-pass
    |%
    ++  writer-sect
      |=  [ships=(set ship) =association:met:q]
      =/  =sect:g
        (rap 3 %quorum '-' (scot %p p.flag) '-' q.flag ~)
      =/  title=@t
        (rap 3 'Writers: ' title.metadatum.association ~)
      =/  desc=@t
        (rap 3 'The writers role for the ' title.metadatum.association ' notebook' ~)
      %+  poke-group  %import-writers
      :+  group.association   now.bowl
      [%cabal sect %add title desc '' '']
    ::
    ++  poke-group
      |=  [=term =action:g]
      ^+  bo-core
      =/  =dock      [our.bowl %groups] :: [p.p.action %groups] XX: check?
      =/  =wire      (snoc bo-area term)
      =.  cor
        (emit %pass wire %agent dock %poke act:mar:g !>(action))
      bo-core
    ::
    ++  create-channel
      |=  [=term group=flag:g =channel:g]
      ^+  bo-core
      %+  poke-group  term
      ^-  action:g
      :+  group  now.bowl
      [%channel [dap.bowl flag] %add channel]
    ::
    ++  import-channel
      |=  =association:met:q
      =/  meta=data:meta:g
        [title description '' '']:metadatum.association
      (create-channel %import group.association meta now.bowl zone=%default %| ~)
    ::
    ++  add-channel
      |=  req=create:q
      %+  create-channel  %create
      [group.req =,(req [[title description '' ''] now.bowl %default %| readers])]
    ::
    --
  ::
  ++  bo-init
    |=  req=create:q
    =/  upd=update:q
      [%new-board group.req ~(tap in writers.req) title.req description.req ~]
    =.  bo-core  (bo-update upd)
    =.  cor  (give-brief flag bo-brief)
    (add-channel:bo-pass req)
  ::
  ++  bo-brief
    [last=last-read.remark.metadata.board count=1 read-id=~]
  ::
  ++  bo-peek
    |=  path=(pole knot)
    ^-  (unit (unit cage))
    ?+    path  [~ ~]
        [%metadata ~]
      ``quorum-metadata+!>(metadata.board)
    ::
        [%questions index=@ ~]
      =/  index=@ud  (slav %ud index.path)
      ``quorum-page+!>((quest index ~(threads via:q board)))
    ::
        [%search index=@ query=@ ~]
      =/  index=@ud  (slav %ud index.path)
      =/  query=@t   (slav %t query.path)
      ``quorum-page+!>((search index (~(search via:q board) query)))
    ::
        [%thread post-id=@ ~]
      =/  post-id=@ud  (slav %ud post-id.path)
      ``quorum-thread+!>((~(threadi via:q board) post-id))
    ==
  ::
  ++  bo-watch
    |=  path=(pole knot)
    ^+  bo-core
    ?+    path  ~|(bad-watch-path/path !!)
        [?(%meta %search) %ui ~]
      ?>(from-self bo-core)
    ::
        [%thread post-id=@ %ui ~]
      =/  post-id=@ud  (slav %ud post-id.path)
      ?>(from-self bo-core)
    ==
  ::
  ++  bo-join
    |=  j=join:q
    ^+  bo-core
    =.  flag  chan.j
    =.  cor  (pull (surf:da-boards bo-da-path))
    ::  TODO: Need to do this stuff afer the data is imported!
    ::  =.  cor  (notify [chan.j %new-board group.j '' '' ~])
    ::  =.  bo-core  (bo-abed chan.j)
    ::  =.  group.perm.metadata.board  group.j
    ::  =.  last-read.remark.metadata.board  now.bowl
    ::  =.  cor  (give-brief flag bo-brief)
    bo-core
  ::
  ++  bo-leave
    =.  cor  (pull ~ (quit:da-boards bo-da-path))
    =.  cor  (emit %give %fact ~[/briefs] quorum-leave+!>(flag))
    =.  gone  &
    bo-core
  ::
  ++  bo-remark-diff
    |=  diff=remark-diff:q
    ^+  bo-core
    =*  r  remark.metadata.board
    =.  cor  (give %fact ~[(snoc bo-area %ui)] quorum-remark-action+!>([flag diff]))
    =.  r
      ?-    -.diff
        %read  r(last-read `@da`(add last-read.r (div ~s1 100)))
        ?(%watch %unwatch %read-at)  !!
      ==
    =.  cor  (give-brief flag bo-brief)
    bo-core
  ++  bo-proxy
    |=  =update:q
    ^+  bo-core
    ?>  bo-can-write
    =/  =dock  [p.flag dap.bowl]
    =/  =cage  [%quorum-action !>([flag update])]
    =.  cor  (emit %pass bo-area %agent dock %poke cage)
    bo-core
  ::  TODO: Move '+notify' source down here if possible
  ++  bo-update
    |=  =update:q
    ?>  bo-can-write
    ^+  bo-core
    =/  =action:q  [flag update]
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  to avoid errors during delete actions.
    =.  cor  (notify action)
    ?:  ?=(%delete-board -.update)
      =.  cor  (push ~ (kill:du-boards [bo-du-path]~))
      =.  cor  (emit %give %fact ~[/briefs] quorum-leave+!>(flag))
      =.  gone  &
      bo-core
    =.  board  (apply:q board bowl action)
    =.  cor  (push (give:du-boards bo-du-path bowl action))
    bo-core
  --
--
