/-  boards
/+  n=nectar, f=forums-poke
/+  verb, dbug
/+  *sss, *etch
/+  default-agent

|%
+$  board
  $:  =metadata:f
      =database:n
  ==
+$  state-0
  $:  %0
      boards=(map flag:f board)
  ==
+$  versioned-state
  $%  state-0
  ==
--
%-  agent:dbug
%+  verb  &
^-  agent:gall
::  listen for subscriptions on [%forums ....]
=/  sub-boards  (mk-subs boards ,[%forums %updates @ @ ~])
::  publish updates on [%forums %updates @ ~]
::  [%forums %updates %host %board-name ~]
=/  pub-boards  (mk-pubs boards ,[%forums %updates @ @ ~])
=<
=|  state=state-0
|_  =bowl:gall
+*  this  .
    def  ~(. (default-agent this %.n) bowl)
    da-boards  =/  da  (da boards ,[%forums %updates @ @ ~])
                   (da sub-boards bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
    du-boards  =/  du  (du boards ,[%forums %updates @ @ ~])
                  (du pub-boards bowl -:!>(*result:du))
++  on-init  `this
++  on-save  !>([state sub-boards pub-boards])  ::!>([sub-forums pub-forums])
++  on-load
  |=  =vase
  =/  old  !<([versioned-state =_sub-boards =_pub-boards] vase)
  :-  ~
  %=    this
      state       
    ?-    -.-.old
        %0
      -.old
    ==
    sub-boards  sub-boards.old
    pub-boards  pub-boards.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
      %forums-poke
    =/  poke=forums-poke:f  !<(forums-poke:f vase)
    ?:  !=(our.bowl p.p.poke)
      :_  this
      :~  :*  %pass   /forums/action
              %agent  [p.p.poke %forums]
              %poke   %forums-poke  vase
      ==  ==
    ?:  ?=([%delete-board *] q.poke)
      :-  ~[(~(ui emit bowl) poke)]
      %=    this
          boards.state  (~(del by boards.state) p.poke)
          pub-boards    (kill:du-boards [%forums %updates our.bowl q.p.poke ~]~)
      ==
    =/  board=(unit board)  (~(get by boards.state) p.poke)
    =.  boards.state  
      %+  ~(put by boards.state)
        p.poke
      ?@  board
        (~(fo handle-poke:f [bowl *metadata:f ~]) poke)
      ?:  ?=(%new-board -.q.poke)
        ~|('%forums: board already exists' !!)
      =+  (need board)
      (~(fo handle-poke.f [bowl metadata.- database.-]) poke)
    =^  cards  pub-boards  (give:du-boards [%forums %updates our.bowl q.p.poke ~] [bowl poke])
    =.  cards  (weld cards ~[(~(ui emit bowl) poke)])
    [cards this]
  :: 
      %surf-boards
    =^  cards  sub-boards
      (surf:da-boards !<(@p (slot 2 vase)) %forums !<([%forums %updates @ @ ~] (slot 3 vase)))
    [cards this]
  ::
      %sss-on-rock
    `this
  ::
      %quit-boards
    =.  sub-boards
      (quit:da-boards !<(@p (slot 2 vase)) %boards !<([%forums %updates @ @ ~] (slot 3 vase)))
    `this
  ::
      %sss-to-pub
    ?-  msg=!<(into:du-boards (fled vase))
        [[%forums *] *]
      =^  cards  pub-boards  (apply:du-boards msg)
      [cards this]
    ==
  ::
      %sss-boards
    =/  res  !<(into:da-boards (fled vase))
    =^  cards  sub-boards  (apply:da-boards res)
    ::  Check for wave, emit wave.
    ?+    type.res  [cards this]
        %scry
      =?    cards
          ?=(%wave what.res)
        (weld cards ~[(~(ui emit bowl.wave.res) poke.wave.res)])
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
        [~ %sss %on-rock @ @ @ %forums %updates @ @ ~]
      `this
    ::
        [~ %sss %scry-request @ @ @ %forums %updates @ @ ~]
      =^  cards  sub-boards  (tell:da-boards |3:wire sign)
      [cards this]
    ==
  ==
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
    ?+    wire  `this
    [~ %sss %behn @ @ @ %forums %updates @ @ ~]  [(behn:da-boards |3:wire) this]
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  =/  at-page
    |*  [pag=@ud lis=(list)]
    =/  pag-len=@  50
    =/  lis-len=@  (lent lis)
    :-  (scag pag-len (slag (mul pag pag-len) lis))
    %+  add  (div lis-len pag-len)
    =(0 (mod lis-len pag-len))
  =/  board-map=(map flag:f board)
    %-  ~(uni by boards.state)
    =/  da-tap=(list [* [* * board]])  ~(tap by read:da-boards)
    =/  da-f2r  (turn da-tap |=([* [* * bord=board]] [board.metadata.bord bord]))
    (malt `(list [flag:f board])`da-f2r)
  ?+    path  [~ ~]
      [%x %boards ~]
    :^    ~  
        ~
      %forums-metadatas
    !>  ^-  (list metadata:f)
    %+  turn 
      ~(val by board-map) 
    |=(=board metadata.board)
  ::
      [%x %search @ @ ~]
    =/  page=@ud  (slav %ud +>-.path)
    =/  query=@t  (slav %t +>+<.path)
    :^    ~  
        ~  
      %forums-page
    !>  ^-  page:f
    %+  at-page  
      page
    ^-  (list post:f)
    %-  zing
    %+  turn  
      ~(val by board-map)
    |=(=board (~(search via board) query))
::
      [%x %board @ @ *]
    =/  board-host=@p  (slav %p +>-.path)
    =/  board-name=term  (slav %tas +>+<.path)
    =/  board-pole=*  +>+>.path
    =/  =board  (~(got by board-map) [board-host board-name])
    ?+    board-pole  !!
        [%metadata ~]
      :^    ~  
          ~  
        %forums-metadata
      !>  ^-  metadata:f
      metadata.board
    ::
        [%questions @ ~]
      =/  page=@ud  (slav %ud +<.board-pole)
      :^    ~  
          ~  
        %forums-page
      !>  ^-  page:f
      %+  at-page  
        page
      ~(survey via board)
    ::
        [%search @ @ ~]
      =/  page=@ud  (slav %ud +<.board-pole)
      =/  query=@t  (slav %t +>-.board-pole)
      :^    ~  
          ~  
       %forums-page
      !>  ^-  page:f
      %+  at-page  
        page
      (~(search via board) query)
    ::
        [%thread @ ~]
      =/  post-id=@ud  (slav %ud +<.board-pole)
      :^    ~  
          ~  
        %forums-thread
      !>  ^-  thread:f
      (~(pluck via board) post-id)
    :: 
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card:agent:gall _this)
  ?+    path  `this
      [%quorum @ @ %ui ~]
    :_  this
    ::  TODO what to put upon initial subscription? Currently it's just passing empty json.
    ~[(~(init emit bowl) -.+.+.path)]
  ==
++  on-leave  on-leave:def
++  on-fail   on-fail:def
--
::  hc: helper core
=>
|%
++  via
  |_  [=metadata:f =database:n]
  ::
  ++  survey  ::  get all threads
    |-
    ^-  (list post:f)
    (dump %threads ~)
  ::
  ++  search  ::  search all posts matching query
    |=  query=@t
    ^-  (list post:f)
    =/  cquery=tape  (cass (trip query))
    ::  TODO: Do a combined search over threads and posts and include
    ::  both types of entry in the result.
    %+  dump  %posts
    :*  ~  %s  %history  %|
        |=  =value:n
        ?>  ?=([%b *] value)
        =+  ;;(edits:f p.value)
        =/  [[* * content=@t] *]  (pop:om-hist:f -)
        ::  TODO: Improve the search algorithm used here
        ?=(^ (find cquery (cass (trip content))))
    ==
  ::
  ++  pluck  ::  get particular thread
    |=  id=@ud
    ^-  [post:f (list post:f)]
    =/  root-row=post:f  
    %+  snag 
      0 
    (dump %threads `[%s %l-post-id %& %eq id])
    =/  root-replies=(set @)  replies:(need thread.root-row)
    :-  root-row
    %+  dump  %posts
    :*  ~  %s  %post-id  %|
        |=  post-id=value:n
        ?>  ?=(@ post-id)
        (~(has in root-replies) post-id)
    ==
  ::
  ++  dump  ::  db entries by table (optionally filtered)
    |=  [table=?(%posts %threads) filter=(unit condition:n)]
    ^-  (list post:f)
    =+  filter-cond=?^(filter (need filter) [%n ~])
    %+  turn
      =<  -
      %+  ~(q db:n database)  %forums
      ?-    table
          %posts
        [%select %posts filter-cond]
      ::
          %threads
        :*  %theta-join  %posts  %threads
            %and  filter-cond
            [%d %l-post-id %r-post-id %& %eq]
        ==
      ==
    |=  =row:n
    !<  post:f
    :-  -:!>(*post:f)
    ::  FIXME: Find a better way to convert from a list like 'row:nectar' to a
    ::  fixed-length tuple like 'post:forums'.
    :*  post-id=(snag 0 row)
        parent-id=(snag 1 row)
        comments==+(v=(snag 2 row) ?>(?=([%s *] v) p.v))
        votes==+(v=(snag 3 row) ?>(?=([%m *] v) p.v))
        history==+(v=(snag 4 row) ?>(?=([%b *] v) p.v))
        ^=  thread
        ?-    table
            %posts
          ~
        ::
            %threads
          :*  ~
              replies==+(v=(snag 6 row) ?>(?=([%s *] v) p.v))
              best-id=(snag 7 row)
              title=(snag 8 row)
              tags==+(v=(snag 9 row) ?>(?=([%s *] v) p.v))
          ==
        ==
        board=board.metadata
        group=group.metadata
    ==
--  --
|%
++  emit
  =,  enjs:format
  |_  bol=bowl:gall
  ++  init
    |=  name=term
    ^-  card:agent:gall
    :*  %give
        %fact
        ~[/quorum/(scot %p our.bol)/(scot %tas name)/ui]
        [%json !>(*^json)]
    ==
  ::
  ++  ui
    ::  For board added or deleted or edited
    |=  =forums-poke:f
    ^-  card:agent:gall
    =/  act  q.forums-poke
    =/  board-name  q.p.forums-poke
    ::  Sometimes the bol is from the original wave, not from this agent.
    =/  host  our.bol
    =;  jon=^json
      ::  ~&  >  jon
      :*  %give
          %fact
          ~[/quorum/(scot %p host)/(scot %tas board-name)/ui]
          [%json !>(jon)]
      ==
    ::  =-  ~&(- -)
    %-  en-vase
    ?+    -.act  !!
        %new-board
      !>
      :*  ^=  new-board
          :*  board=(crip "{<p.p.forums-poke>}/{<q.p.forums-poke>}")
              group=(crip "{<p.group.act>}/{<p.group.act>}")
              title=title.act
              description=description.act
              tags=tags.act
      ==  ==
    ::
        %edit-board
      !>
      :*  ^=  edit-board
          :*  title=title.act
              description=description.act
              tags=tags.act
      ==  ==
    ::
        %delete-board
      !>
      :*  ^=  delete-board
          :*  ~
      ==  ==
    ::
        %new-thread
      !>
      :*  ^=  new-thread
          :*  title=title.act
              content=content.act
              author=src.bol
              tags=tags.act
      ==  ==
    ::
        %edit-thread
      !>
      :*  ^=  edit-thread
          :*  post-id=post-id.act
              best-id=best-id.act
              title=title.act
              tags=tags.act
      ==  ==
    ::
        %new-reply
      !>
      :*  ^=  new-reply
          :*  parent-id=parent-id.act
              content=content.act
              is-comment=is-comment.act
      ==  ==
    ::
        %edit-post
      !>
      :*  ^=  edit-post
          :*  post-id=post-id.act
              content=content.act
      ==  ==
    ::
        %delete-post
      !>
      :*  ^=  delete-post
          :*  post-id=post-id.act
      ==  ==
    ::
        %vote
      !>
      :*  ^=  vote
          :*  post-id=post-id.act
              dir=dir.act
      ==  ==
    ==
  --
--
