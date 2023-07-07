/-  boards
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
  ^+  cor
  ?+    mark  cor
      %quorum-action
    =/  act=action:q  !<(action:q vase)
    =/  du-path       [%quorum %updates p.p.act q.p.act ~]
    ?:  !=(our.bowl p.p.act)
      (emit %pass /quorum/action %agent [p.p.act %quorum] %poke %quorum-action vase)
    =/  act-board=(unit board:q)  (~(get by our-boards) p.act)
    ?.  |(=(%new-board -.q.act) ?=(^ act-board))
      ~|("%quorum: can't submit {<-.q.act>} to nonexistent board {<p.act>}" !!)
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  to avoid errors during delete actions.
    =.  cor  (notify act)
    ?:  ?=(%delete-board -.q.act)
      =.  our-boards  (~(del by our-boards) p.act)
      (push ~ (kill:du-boards [du-path]~))
    =.  our-boards  (~(put by our-boards) p.act (apply:q (fall act-board *board:q) bowl act))
    (push (give:du-boards du-path [bowl act]))
  ::
      %surf-boards
    =/  da-path  [!<(@p (slot 2 vase)) %quorum !<([%quorum %updates @ @ ~] (slot 3 vase))]
    (pull (surf:da-boards da-path))
  ::
      %sss-on-rock
    cor
  ::
      %quit-boards
    =/  da-path  [!<(@p (slot 2 vase)) %quorum !<([%quorum %updates @ @ ~] (slot 3 vase))]
    (pull ~ (quit:da-boards da-path))
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
    =?  cor  ?=(%scry type.res)
      %-  notify
      ?-  what.res
        %wave  act.wave.res
        %rock  =/  m=metadata:q  metadata.rock.res
               [board.m %new-board group.m title.m description.m ~(tap in allowed-tags.m)]
      ==
    (pull (apply:da-boards res))
  ==
::
++  watch
  |=  path=(pole knot)
  ^+  cor
  ?+    path  !!
      [?(%meta %search) %ui ~]
    cor
  ::
      [%quorum host=@ name=@ board-path=*]
    =/  board-host=@p  (slav %p host.path)
    =/  board-name=term  (slav %tas name.path)
    =/  board-path=*  board-path.path
    ?+    board-path  !!
        [?(%meta %search) %ui ~]
      cor
    ::
        [%thread post-id=@ %ui ~]
      =/  post-id=@ud  (slav %ud post-id.board-path)
      cor
    ==
  ==
::
++  peek
  =/  flip  (flip:q 20)
  |=  path=(pole knot)
  ^-  (unit (unit cage))
  =/  all-boards=(map flag:q board:q)  all-boards
  ?+    path  [~ ~]
      [%x %boards ~]
    :^  ~  ~  %quorum-metadatas
    !>  ^-  (list metadata:q)
    %+  turn
      ~(val by all-boards)
    |=(=board:q metadata.board)
  ::
      [%x %search index=@ query=@ ~]
    =/  index=@ud  (slav %ud index.path)
    =/  query=@t  (slav %t query.path)
    :^  ~  ~  %quorum-page
    !>  ^-  page:q
    %+  flip  index
    %+  sort:poast:q  ~[[%score %&] [%act-date %&]]
    ^-  (list post:q)
    %-  zing
    %+  turn
      ~(val by all-boards)
    |=(=board:q (~(search via:q board) query))
  ::
      [%x %board host=@ name=@ board-path=*]
    =/  board-host=@p  (slav %p host.path)
    =/  board-name=term  (slav %tas name.path)
    =/  board-path=*  board-path.path
    =/  =board:q  (~(got by all-boards) [board-host board-name])
    ?+    board-path  !!
        [%metadata ~]
      :^  ~  ~  %quorum-metadata
      !>  ^-  metadata:q
      metadata.board
    ::
        [%questions index=@ ~]
      =/  index=@ud  (slav %ud index.board-path)
      :^  ~  ~  %quorum-page
      !>  ^-  page:q
      %+  flip  index
      %+  sort:poast:q  ~[[%best %|] [%pub-date %&] [%score %&]]
      ~(threads via:q board)
    ::
        [%search index=@ query=@ ~]
      =/  index=@ud  (slav %ud index.board-path)
      =/  query=@t  (slav %t query.board-path)
      :^  ~  ~  %quorum-page
      !>  ^-  page:q
      %+  flip  index
      %+  sort:poast:q  ~[[%score %&] [%act-date %&]]
      (~(search via:q board) query)
    ::
        [%thread post-id=@ ~]
      =/  post-id=@ud  (slav %ud post-id.board-path)
      :^  ~  ~  %quorum-thread
      !>  ^-  thread:q
      (~(threadi via:q board) post-id)
    ==
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
++  all-boards
  ^-  (map flag:q board:q)
  %-  ~(uni by our-boards)
  =/  da-tap=(list [* [? ? board:q]])  ~(tap by read:da-boards)
  =/  da-f2r  (turn da-tap |=([* [? ? =board:q]] [board.metadata.board board]))
  (malt `(list [flag:q board:q])`da-f2r)
--
