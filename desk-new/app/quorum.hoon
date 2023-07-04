/-  boards
/+  n=nectar, q=quorum, j=quorum-json
/+  verb, dbug
/+  *sss
/+  default-agent

|%
+$  state-0
  $:  %0
      boards=(map flag:q board:q)
  ==
+$  versioned-state
  $%  state-0
  ==
--
%-  agent:dbug
%+  verb  &
^-  agent:gall
::  listen for subscriptions on [%quorum %updates %host %board-name ~]
=/  sub-boards  (mk-subs boards ,[%quorum %updates @ @ ~])
::  publish updates on [%quorum %updates %host %board-name ~]
=/  pub-boards  (mk-pubs boards ,[%quorum %updates @ @ ~])
=<
=|  state=state-0
|_  =bowl:gall
+*  this  .
    def  ~(. (default-agent this %.n) bowl)
    da-boards  =/  da  (da boards ,[%quorum %updates @ @ ~])
                   (da sub-boards bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
    du-boards  =/  du  (du boards ,[%quorum %updates @ @ ~])
                   (du pub-boards bowl -:!>(*result:du))
++  on-init  `this
++  on-save  !>([state sub-boards pub-boards])
++  on-load
  |=  =vase
  =/  old  !<([versioned-state =_sub-boards =_pub-boards] vase)
  :-  ~
  %=    this
      state
    ?-  -<.old
      %0  -.old
    ==
    sub-boards  sub-boards.old
    pub-boards  pub-boards.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
      %quorum-action
    =/  act=action:q  !<(action:q vase)
    ?:  !=(our.bowl p.p.act)
      :_  this
      :~  :*  %pass   /quorum/action
              %agent  [p.p.act %quorum]
              %poke   %quorum-action  vase
      ==  ==
    =/  board=(unit board:q)  (~(get by boards.state) p.act)
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  (important during post/board delete ops)!
    =/  ui-cards=(list card:agent:gall)  (emit-ui board bowl act)
    ?:  ?=([%delete-board *] q.act)
      :-  ui-cards
      %=    this
          boards.state  (~(del by boards.state) p.act)
          pub-boards    (kill:du-boards [%quorum %updates our.bowl q.p.act ~]~)
      ==
    =.  boards.state
      %+  ~(put by boards.state)
        p.act
      ?~  board
        (apply:q *board:q bowl act)
      ?:  ?=(%new-board -.q.act)
        ~|('%quorum: board already exists' !!)
      (apply:q (need board) bowl act)
    =^  cards  pub-boards  (give:du-boards [%quorum %updates our.bowl q.p.act ~] [bowl act])
    =.  cards  (weld cards ui-cards)
    [cards this]
  ::
      %surf-boards
    =^  cards  sub-boards
      (surf:da-boards !<(@p (slot 2 vase)) %quorum !<([%quorum %updates @ @ ~] (slot 3 vase)))
    [cards this]
  ::
      %sss-on-rock
    `this
  ::
      %quit-boards
    =.  sub-boards
      (quit:da-boards !<(@p (slot 2 vase)) %boards !<([%quorum %updates @ @ ~] (slot 3 vase)))
    `this
  ::
      %sss-to-pub
    ?-    msg=!<(into:du-boards (fled vase))
        [[%quorum *] *]
      =^  cards  pub-boards  (apply:du-boards msg)
      [cards this]
    ==
  ::
      %sss-boards
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  (important during post/board delete ops)!
    ::  FIXME: Make this more reliable and eliminate code duplication
    =/  board-map=(map flag:q board:q)
      %-  ~(uni by boards.state)
      =/  da-tap=(list [* [? ? board:q]])  ~(tap by read:da-boards)
      =/  da-f2r  (turn da-tap |=([* [? ? bord=board:q]] [board.metadata.bord bord]))
      (malt `(list [flag:q board:q])`da-f2r)
    =/  res  !<(into:da-boards (fled vase))
    =^  cards  sub-boards  (apply:da-boards res)
    ::  Check for wave, emit wave.
    ?+    type.res  [cards this]
        %scry
      =?    cards
          ?=(%wave what.res)
        =/  board=(unit board:q)  (~(get by board-map) p.act.wave.res)
        (weld cards (emit-ui board bowl.wave.res act.wave.res))
      [cards this]
    ==
  ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card:agent:gall _this)
  ?+    -.sign  `this
      %poke-ack
    ?~  p.sign  `this
    %-  (slog u.p.sign)
    ?+    wire  `this
        [~ %sss %on-rock @ @ @ %quorum %updates @ @ ~]
      `this
    ::
        [~ %sss %scry-request @ @ @ %quorum %updates @ @ ~]
      =^  cards  sub-boards  (tell:da-boards |3:wire sign)
      [cards this]
    ==
  ==
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
  ?+  wire  `this
    [~ %sss %behn @ @ @ %quorum %updates @ @ ~]  [(behn:da-boards |3:wire) this]
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  =/  at-page
    |*  [pag=@ud lis=(list)]
    =/  pag-len=@  20
    =/  lis-len=@  (lent lis)
    :-  (scag pag-len (slag (mul pag pag-len) lis))
    %+  add  (div lis-len pag-len)
    =(0 (mod lis-len pag-len))
  =/  board-map=(map flag:q board:q)
    %-  ~(uni by boards.state)
    =/  da-tap=(list [* [? ? board:q]])  ~(tap by read:da-boards)
    ::  ~&  (turn da-tap |=([* [stale=? fail=? bord=board:q]] [board.metadata.bord stale fail]))
    =/  da-f2r  (turn da-tap |=([* [? ? bord=board:q]] [board.metadata.bord bord]))
    (malt `(list [flag:q board:q])`da-f2r)
  ?+    path  [~ ~]
      [%x %boards ~]
    :^  ~  ~  %quorum-metadatas
    !>  ^-  (list metadata:q)
    %+  turn
      ~(val by board-map)
    |=(=board:q metadata.board)
  ::
      [%x %search @ @ ~]
    =/  page=@ud  (slav %ud +>-.path)
    =/  query=@t  (slav %t +>+<.path)
    =/  qtoks     (parse-query query)
    :^  ~  ~  %quorum-page
    !>  ^-  page:q
    %+  at-page
      page
    %-  sort:poast:q
    ^-  (list post:q)
    %-  zing
    %+  turn
      ~(val by board-map)
    |=(=board:q (~(search via:q board) qtoks))
::
      [%x %board @ @ *]
    =/  board-host=@p  (slav %p +>-.path)
    =/  board-name=term  (slav %tas +>+<.path)
    =/  board-pole=*  +>+>.path
    =/  =board:q  (~(got by board-map) [board-host board-name])
    ?+    board-pole  !!
        [%metadata ~]
      :^  ~  ~  %quorum-metadata
      !>  ^-  metadata:q
      metadata.board
    ::
        [%questions @ ~]
      =/  page=@ud  (slav %ud +<.board-pole)
      :^  ~  ~  %quorum-page
      !>  ^-  page:q
      %+  at-page
        page
      %-  sort:poast:q
      ~(survey via:q board)
    ::
        [%search @ @ ~]
      =/  page=@ud  (slav %ud +<.board-pole)
      =/  query=@t  (slav %t +>-.board-pole)
      =/  qtoks     (parse-query query)
      :^  ~  ~  %quorum-page
      !>  ^-  page:q
      %+  at-page
        page
      %-  sort:poast:q
      (~(search via:q board) qtoks)
    ::
        [%thread @ ~]
      =/  post-id=@ud  (slav %ud +<.board-pole)
      :^  ~  ~  %quorum-thread
      !>  ^-  thread:q
      (~(pluck via:q board) post-id)
    ::
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card:agent:gall _this)
  ?+    path  !!
      [?(%meta %search) %ui ~]
    `this
  ::
      [%quorum @ @ *]
    =/  board-host=@p  (slav %p +<.path)
    =/  board-name=term  (slav %tas +>-.path)
    =/  board-pole=*  +>+.path
    ?+    board-pole  !!
        [?(%meta %search) %ui ~]
      `this
    ::
        [%thread @ %ui ~]
      =/  post-id=@ud  (slav %ud +<.board-pole)
      `this
    ==
  ==
++  on-leave  on-leave:def
++  on-fail   on-fail:def
--
|%
++  parse-query
  |=  query=@t
  ^-  (list token:query:q)
  %+  scan  (cass (trip query))
  %+  more  (plus ace)
  ;~  pose
      ;~  (glue col)
          (cold %author (jest 'author'))
          ;~  pfix
              sig
              %-  sear
              :_  crub:so
              |=([p=@ta q=@] ?:(=(p 'p') (some (scot %p q)) ~))
      ==  ==
      ;~((glue col) (cold %tag (jest 'tag')) sym)
      (stag %content (cook crip (plus ;~(less col ace qit))))
  ==
++  emit-ui
  |=  [bod=(unit board:q) bol=bowl:gall act=action:q]
  ^-  (list card:agent:gall)
  =/  jon=json  (action:enjs:j act)
  ::  FIXME: Use `our.bol` here, or `p.p.act`?
  =-  [%give %fact upd-paths %json !>(jon)]~
  ^=  upd-paths
  ^-  (list path)
  =/  base-path=path  /quorum/(scot %p our.bol)/(scot %tas q.p.act)
  =/  base-post=(unit post:q)
    ?+  -.q.act  ~
      %new-thread   =+(post=*post:q `post(post-id next-id:metadata:(need bod)))
      %edit-thread  `(~(root via:q (need bod)) post-id.q.act)
      %new-reply    `(~(root via:q (need bod)) parent-id.q.act)
      %edit-post    `(~(root via:q (need bod)) post-id.q.act)
      %delete-post  `(~(root via:q (need bod)) post-id.q.act)
      %vote         `(~(root via:q (need bod)) post-id.q.act)
    ==
  ;:  weld
      ::  /search/ui: top-level search content
      [/search/ui]~
      ::  /quorum/~ship/board/search/ui: board-level search content
      [(weld base-path /search/ui)]~
      ::  /meta/ui: top-level board metadata
      ?^(base-post ~ [/meta/ui]~)
      ::  /quorum/~ship/board/meta/ui: board-level metadata
      ?^(base-post ~ [(weld base-path /meta/ui)]~)
      ::  /quorum/~ship/board/thread/tid/ui: thread-level content
      ?~(base-post ~ [(weld base-path /thread/(scot %ud post-id.u.base-post)/ui)]~)
  ==
--
