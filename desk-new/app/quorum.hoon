/-  boards, g=groups
/+  n=nectar, q=quorum, j=quorum-json
/+  verb, dbug
/+  *sss
/+  default-agent
^-  agent:gall
=>
  |%
  +$  state-0
    $:  %0
        our-boards=(map flag:q board:q)
        all-remarks=(map flag:q remark:q)
        sub-boards=_(mk-subs boards ,[%quorum %updates @ @ ~])
        pub-boards=_(mk-pubs boards ,[%quorum %updates @ @ ~])
    ==
  +$  versioned-state
    $%  state-0
    ==
  +$  card  card:agent:gall
  ++  search  (cury seek ~[[%score %&] [%act-date %&]])
  ++  quest   (cury seek ~[[%best %|] [%pub-date %&] [%score %&]])
  ++  seek
    |=  [order=(lest spec:order:q) index=@ud posts=(list post:q)]
    ^-  page:q
    (flip index (sort:poast:q order posts))
  ++  flip
    =/  pag-len=@ud  20
    |*  [pag=@ud lis=(list)]
    =/  lis-len=@ud  (lent lis)
    :-  (scag pag-len (slag (mul pag pag-len) lis))
    %+  add  (div lis-len pag-len)
    =(0 (mod lis-len pag-len))
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
  watch-groups
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
  ^+  cor
  ?+    mark  ~|(bad-poke/mark !!)
  :: %groups pokes ::
      %quorum-create
    =+  !<(req=create:q vase)
    |^  ^+  cor
    ~_  leaf+"Create failed: check group permissions"
    ?>  =(our.bowl src.bowl)  ::  only accept creates from local ship
    ?>  can-nest
    ?>  ((sane %tas) name.req)
    =/  =flag:q  [our.bowl name.req]
    =.  our-boards  (~(put by our-boards) flag *board:q)
    bo-abet:(bo-init:(bo-abed:bo-core flag) req)
    ++  can-nest  ::  does group exist, are we allowed
      ^-  ?
      =/  gop  (~(got by groups) group.req)
      %-  ~(any in bloc.gop)
      ~(has in sects:(~(got by fleet.gop) our.bowl))
    ++  groups  ::  all groups on this ship
      .^  groups:g
        %gx
        /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/noun
      ==
    --
  ::
      %channel-join
    =+  !<(j=join:q vase)
    ^+  cor
    ?:  =(our.bowl src.bowl)  ::  we're initiating a join on a remote ship
      ?<  =(our.bowl p.chan.j)  ::  cannot join board we host
      ?<  (~(has by all-boards) chan.j)  ::  must not be in board to join
      bo-abet:(bo-request-join:(bo-abed:bo-core chan.j) j)
    ?:  =(our.bowl p.chan.j)  ::  remote ship's asking to join a local channel
      ?>  (~(has by our-boards) chan.j)  ::  local must have requested channel
      bo-abet:(bo-respond-join:(bo-abed:bo-core chan.j) j)
    ~|(bad-channel-join/j !!)
  ::
      %quorum-leave
    =+  !<(l=leave:q vase)
    ^+  cor
    ?>  =(our.bowl src.bowl)  ::  only accept leaves from local ship
    ?<  =(our.bowl p.l)  ::  cannot leave board we host
    ?>  (~(has by all-boards) l)  ::  must be in board to leave
    bo-abet:bo-leave:(bo-abed:bo-core l)
  ::
      %quorum-remark-action
    =+  !<(act=remark-action:q vase)
    ?>  =(our.bowl src.bowl)  ::  only accept remarks from local ship
    bo-abet:(bo-remark-diff:(bo-abed:bo-core p.act) q.act)
  :: native pokes ::
      %quorum-action
    =+  !<(=action:q vase)
    ?>  (~(has by all-boards) p.action)
    =/  board-core  (bo-abed:bo-core p.action)
    ?:  =(p.p.action our.bowl)
      bo-abet:(bo-update:board-core q.action)
    bo-abet:(bo-proxy:board-core q.action)
  :: sss pokes ::
      %sss-on-rock
    ?-  msg=!<(from:da-boards (fled vase))
      [[%quorum *] *]  cor
    ==
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
    ::  TODO: Could also update remarks here to have joined boards be
    ::  "read" by default, but it's not necessary.
    =?  cor  ?=(%scry type.res)
      %-  notify
      ?-  what.res
        %wave  act.wave.res
        %rock  =,  metadata.rock.res
               :*  board  %new-board
                   group.perm  ~(tap in writers.perm)
                   title  description  ~(tap in allowed-tags)
               ==
      ==
    =?  cor  ?=(%scry type.res)
      ?-    what.res
          %wave
        =/  =flag:q  p.act.wave.res
        ?:  ?=(?(%new-board %new-thread %new-reply) -.q.act.wave.res)
          (give-brief flag bo-brief:(bo-abed:bo-core flag))
        cor
      ::
          %rock
        =/  =flag:q  board.metadata.rock.res
        (give-brief flag bo-brief:(bo-abed:bo-core flag))
      ==
    (pull (apply:da-boards res))
  ==
::
++  watch
  |=  path=(pole knot)
  ^+  cor
  ?+    path  ~|(bad-watch-path/path !!)
      [%briefs ~]               ?>(from-self cor)
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
    ?>  (~(has by all-boards) ship name)
    (bo-peek:(bo-abed:bo-core ship name) path.path)
  ==
::
++  agent
  |=  [path=(pole knot) =sign:agent:gall]
  ^+  cor
  ?+    path  cor
      [~ %sss %scry-request @ @ @ %quorum %updates @ @ ~]
    ?>  ?=(%poke-ack -.sign)
    ?~  p.sign  cor
    %-  (slog u.p.sign)
    (pull (tell:da-boards |3:path sign))
  ::
      [%quorum ship=@ name=@ path=*]
    =/  ship=@p    (slav %p ship.path)
    =/  name=term  (slav %tas name.path)
    bo-abet:(bo-agent:(bo-abed:bo-core ship name) path.path sign)
  ::
      [%groups ~]
    ?+    -.sign  !!
        %kick
      watch-groups
    ::
        %watch-ack
      ?~  p.sign  cor
      =/  =tank
        leaf/"Failed groups subscription in {<dap.bowl>}, unexpected"
      ((slog tank u.p.sign) cor)
    ::
        %fact
      ?.  =(act:mar:g p.cage.sign)  cor
      (take-groups !<(=action:g q.cage.sign))
    ==
  ==
::
++  arvo
  |=  [path=(pole knot) sign=sign-arvo]
  ^+  cor
  ?+    path  cor
      [~ %sss %behn @ @ @ %quorum %updates @ @ ~]
    (emil (behn:da-boards |3:path))
  ==
::
++  give-brief
  |=  [=flag:q =brief:briefs:q]
  ^+  cor
  (give %fact ~[/briefs] quorum-brief-update+!>([flag brief]))
::
++  watch-groups
  ^+  cor
  (emit %pass /groups %agent [our.bowl %groups] %watch /groups)
::
++  take-groups
  |=  =action:g
  ^+  cor
  =/  affected=(list flag:q)
    %+  murn  ~(tap by all-boards)
    |=  [=flag:q =board:q]
    ?.  =(p.action group.perm.metadata.board)  ~
    `flag
  ?+    q.q.action  cor
      [%fleet * %del ~]
    ~&  "%quorum: revoke perms for {<affected>}"
    %+  roll  affected
    |=  [=flag:q co=_cor]
    =/  bo  (bo-abed:bo-core:co flag)
    bo-abet:(bo-revoke:bo ~(tap in p.q.q.action))
  ::
      [%fleet * %del-sects *]
    ~&  "%quorum: recheck permissions for {<affected>}"
    %+  roll  affected
    |=  [=flag:q co=_cor]
    =/  bo  (bo-abed:bo-core:co flag)
    bo-abet:bo-recheck:bo
  ::
      [%channel * %del-sects *]
    ~&  "%quorum: recheck permissions for {<affected>}"
    %+  roll  affected
    |=  [=flag:q co=_cor]
    =/  bo  (bo-abed:bo-core:co flag)
    bo-abet:bo-recheck:bo
  ==
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
          ?(%new-board %edit-board %delete-board %add-sects %del-sects)
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
  |_  [=flag:q =board:q =remark:q gone=_|]
  ++  bo-core  .
  ++  bo-abet
    %_    cor
        all-remarks
      ?:(gone (~(del by all-remarks) flag) (~(put by all-remarks) flag remark))
    ::
        our-boards
      ?:  !=(our.bowl p.flag)
        our-boards
      ?:(gone (~(del by our-boards) flag) (~(put by our-boards) flag board))
    ==
  ++  bo-abed
    |=  f=flag:q
    %=  bo-core
      flag    f
      board   (~(gut by all-boards) f *board:q)
      remark  (~(gut by all-remarks) f *remark:q)
    ==
  ::  NOTE: Area just for subs and back pokes; scries are at '/board/[flag]/...'
  ++  bo-area  `path`/quorum/(scot %p p.flag)/[q.flag]
  ++  bo-du-path  [%quorum %updates p.flag q.flag ~]
  ++  bo-da-path  [p.flag dap.bowl %quorum %updates p.flag q.flag ~]
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
  ++  bo-groups-channel
    ^-  channel:g
    =/  =path  /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/light/noun
    =+  .^(=groups:g %gx path)
    =/  =group:g  (~(got by groups) group.perm.metadata.board)
    (~(got by channels.group) [dap.bowl flag])
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
    =/  upd=update:q  =,(req [%new-board group ~(tap in writers) title description ~])
    =.  cor  (push ~ (secret:du-boards [bo-du-path]~))
    =.  bo-core  (bo-update upd)
    =.  last-read.remark  next-id.metadata.board
    (add-channel:bo-pass req)
  ::
  ++  bo-brief
    [last=last-read.remark count=(sub next-id.metadata.board last-read.remark)]
  ::
  ++  bo-peek
    |=  path=(pole knot)
    ^-  (unit (unit cage))
    ?+    path  [~ ~]
        [%metadata ~]
      ``quorum-metadata+!>(metadata.board)
    ::
        [%perm ~]
      ``quorum-perm+!>(perm.metadata.board)
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
  ++  bo-agent
    |=  [path=(pole knot) =sign:agent:gall]
    ^+  bo-core
    ?+    path  !!
        ~                                         ::  `+bo-proxy` response
      ?>  ?=(%poke-ack -.sign)
      ?~  p.sign  bo-core
      %-  (slog u.p.sign)
      bo-core
    ::
        [%create ~]                               ::  `+bo-init` response
      ?>  ?=(%poke-ack -.sign)
      %.  bo-core  :: TODO rollback creation if poke fails?
      ?~  p.sign  same
      (slog leaf/"groups create poke failed" u.p.sign)
    ::
        [%edit ~]                               ::  `+bo-proxy` edit response
      ?>  ?=(%poke-ack -.sign)
      %.  bo-core  :: TODO rollback creation if poke fails?
      ?~  p.sign  same
      (slog leaf/"groups edit poke failed" u.p.sign)
    ::
        [%join ~]                                 ::  `+bo-request-join` response
      ?>  ?=(%poke-ack -.sign)
      ?~  p.sign
        ::  NOTE: Don't need to notify or give briefs; this is handled
        ::  by SSS updates.
        =.  cor  (pull (surf:da-boards bo-da-path))
        bo-core
      ((slog leaf/"quorum join poke failed" u.p.sign) bo-core)
    ==
  ::
  ++  bo-request-join
    |=  j=join:q
    ^+  bo-core
    =/  =dock  [p.flag dap.bowl]
    =/  =cage  [%channel-join !>(j)]
    =.  cor  (emit %pass (snoc bo-area %join) %agent dock %poke cage)
    bo-core
  ::
  ++  bo-respond-join
    |=  j=join:q
    ^+  bo-core
    ?>  (bo-can-read src.bowl)
    =.  cor  (push ~ (allow:du-boards [src.bowl]~ [bo-du-path]~))
    bo-core
  ::
  ++  bo-leave
    =.  cor  (notify [flag %edit-board ~ ~ ~])
    =.  cor  (pull ~ (quit:da-boards bo-da-path))
    =.  cor  (emit %give %fact ~[/briefs] quorum-leave+!>(flag))
    =.  gone  &
    bo-core
  ::
  ++  bo-revoke
    |=  bad-ships=(list ship)
    bo-core(cor (push ~ (block:du-boards bad-ships [bo-du-path]~)))
  ::
  ++  bo-recheck
    =/  [ships=(unit (set ship)) *]  (~(got by read:du-boards) bo-du-path)
    ?~  ships  bo-core  ::  should be impossible... error?
    =/  bad-ships=(list ship)
      %+  murn  ~(tap in u.ships)
      |=(=ship ?:((bo-can-read ship) ~ `ship))
    bo-core(cor (push ~ (block:du-boards bad-ships [bo-du-path]~)))
  ::
  ++  bo-remark-diff
    |=  diff=remark-diff:q
    ^+  bo-core
    =.  cor
      (give %fact ~[/meta/ui (weld bo-area /meta/ui)] quorum-remark-action+!>([flag diff]))
    =.  remark
      ?-  -.diff
        %read     remark(last-read next-id.metadata.board)
        %watch    !!  ::  remark(watching &)
        %unwatch  !!  ::  remark(watching |)
        %read-at  !!
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
    =?  cor  ?=(?(%new-board %new-thread %new-reply) -.update)
      (give-brief flag bo-brief)
    ::  TODO: This is a bit hacky and gross, and should be removed by
    ::  tighter metadata integration if possible.
    ?:  ?=(%edit-board -.update)
      ?~  (both title.update description.update)
        bo-core
      =/  act=action:g
        :*  group.perm.metadata.board  now.bowl
            %channel  [dap.bowl flag]  %edit
            =/  =channel:g  bo-groups-channel
            channel(meta [title.metadata.board description.metadata.board '' ''])
        ==
      =/  =dock  [p.flag %groups]
      =/  =cage  [%group-action-1 !>(act)]
      =.  cor  (emit %pass (snoc bo-area %edit) %agent dock %poke cage)
      bo-core
    bo-core
  --
--
