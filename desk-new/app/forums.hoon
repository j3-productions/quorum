/-  boards
/+  n=nectar, f=forums-poke, j=forums-json
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
    =/  board=(unit board)  (~(get by boards.state) p.poke)
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  (important during post/board delete ops)!
    =/  ui-cards=(list card:agent:gall)  (~(ui emit [bowl board]) poke)
    ::  ~&  poke
    ::  ~&  ui-cards
    ?:  ?=([%delete-board *] q.poke)
      :-  ui-cards
      %=    this
          boards.state  (~(del by boards.state) p.poke)
          pub-boards    (kill:du-boards [%forums %updates our.bowl q.p.poke ~]~)
      ==
    =.  boards.state
      %+  ~(put by boards.state)
        p.poke
      ?@  board
        (~(fo handle-poke:f [bowl *metadata:f ~]) poke)
      ?:  ?=(%new-board -.q.poke)
        ~|('%forums: board already exists' !!)
      (~(fo handle-poke.f [bowl (need board)]) poke)
    =^  cards  pub-boards  (give:du-boards [%forums %updates our.bowl q.p.poke ~] [bowl poke])
    =.  cards  (weld cards ui-cards)
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
    ::  NOTE: Effect cards must be generated before state diffs are applied
    ::  (important during post/board delete ops)!
    ::  FIXME: Make this more reliable and eliminate code duplication
    =/  board-map=(map flag:f board)
      %-  ~(uni by boards.state)
      =/  da-tap=(list [* [? ? board]])  ~(tap by read:da-boards)
      =/  da-f2r  (turn da-tap |=([* [? ? bord=board]] [board.metadata.bord bord]))
      (malt `(list [flag:f board])`da-f2r)
    =/  res  !<(into:da-boards (fled vase))
    =^  cards  sub-boards  (apply:da-boards res)
    ::  Check for wave, emit wave.
    ?+    type.res  [cards this]
        %scry
      =?    cards
          ?=(%wave what.res)
        =/  board=(unit board)  (~(get by board-map) p.poke.wave.res)
        ::  ~&  poke.wave.res
        ::  ~&  (~(ui emit [bowl.wave.res board]) poke.wave.res)
        (weld cards (~(ui emit [bowl.wave.res board]) poke.wave.res))
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
    =/  pag-len=@  20
    =/  lis-len=@  (lent lis)
    :-  (scag pag-len (slag (mul pag pag-len) lis))
    %+  add  (div lis-len pag-len)
    =(0 (mod lis-len pag-len))
  =/  board-map=(map flag:f board)
    %-  ~(uni by boards.state)
    =/  da-tap=(list [* [? ? board]])  ~(tap by read:da-boards)
    ::  ~&  (turn da-tap |=([* [stale=? fail=? bord=board]] [board.metadata.bord stale fail]))
    =/  da-f2r  (turn da-tap |=([* [? ? bord=board]] [board.metadata.bord bord]))
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
  ?+    path  !!
      [%ui ~]
    `this
  ::
      [%search %ui ~]
    `this
  ::
      [%quorum @ @ *]
    =/  board-host=@p  (slav %p +<.path)
    =/  board-name=term  (slav %tas +>-.path)
    =/  board-pole=*  +>+.path
    ?+    board-pole  !!
        [%ui ~]
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
::  hc: helper core
|%
++  emit
  |_  [bol=bowl:gall bod=(unit board)]
  ++  ui
    |=  pok=forums-poke:f
    ^-  (list card:agent:gall)
    =/  jon=json  (poke:enjs:j pok)
    ::  FIXME: Use `our.bol` here, or `p.p.pok`?
    =-  [%give %fact upd-paths %json !>(jon)]~
    ^=  upd-paths
    ^-  (list path)
    =/  base-path=path  /quorum/(scot %p our.bol)/(scot %tas q.p.pok)
    =-  ;:  weld
            ?^(base-post ~ [/ui]~)
            [/search/ui]~
            [(weld base-path /ui)]~
            ?~(base-post ~ [(weld base-path /thread/(scot %ud post-id.u.base-post)/ui)]~)
        ==
    ^=  base-post
    ^-  (unit post:f)
    ?+  -.q.pok  ~
      %new-thread   =+(post=*post:f `post(post-id next-id:metadata:(need bod)))
      %edit-thread  `(~(uproot via (need bod)) post-id.q.pok)
      %new-reply    `(~(uproot via (need bod)) parent-id.q.pok)
      %edit-post    `(~(uproot via (need bod)) post-id.q.pok)
      %delete-post  `(~(uproot via (need bod)) post-id.q.pok)
      %vote         `(~(uproot via (need bod)) post-id.q.pok)
    ==
  --
++  via
  |_  [=metadata:f =database:n]
  ::
  ++  survey  ::  get all threads
    |-
    ^-  (list post:f)
    (sort (dump %threads ~))
  ::
  ++  search  ::  search all posts matching query
    |=  query=@t
    ^-  (list post:f)
    =-  =/  get-subquery-set
          |=  tag=@tas
          ^-  (set @t)
          %-  silt
          %-  turn
          :_  |=([* d=@t] d)
          (skim sub-queries |=([t=* *] =(t tag)))
        %-  sort
        %+  dumps
          =+  author-set=(get-subquery-set %author)
          =+  content-list=(turn ~(tap in (get-subquery-set %content)) |=(t=@t (cass (trip t))))
          ?~  =(0 (lent content-list))
            ?~  =(0 ~(wyt in author-set))
              ~
            ::  authors, but no content
            :*  ~  %s  %history  %|
                |=  =value:n
                ?>  ?=([%b *] value)
                =+  ;;(edits:f p.value)
                =/  edit=(unit [* author=@p *])  (ram:om-hist:f -)
                ?>  ?=([~ *] edit)
                =+  value-author-set=(silt `(list @t)`~[(scot %p author.u.edit)])
                =(0 ~(wyt in (~(dif in author-set) value-author-set)))
            ==
          ?~  =(0 ~(wyt in author-set))
            ::  content, but no authors
            :*  ~  %s  %history  %|
                |=  =value:n
                ?>  ?=([%b *] value)
                =+  ;;(edits:f p.value)
                =/  [[* * value-content=@t] *]  (pop:om-hist:f -)
                %+  levy
                  content-list
                |=(c=tape ?=(^ (find c (cass (trip value-content)))))
            ==
          ::  both content and authors
          :*  ~  %s  %history  %|
              |=  =value:n
              ?>  ?=([%b *] value)
              =+  medits=;;(edits:f p.value)
              =/  edit=(unit [* author=@p *])  (ram:om-hist:f medits)
              ?>  ?=([~ *] edit)
              =+  value-author-set=(silt `(list @t)`~[(scot %p author.u.edit)])
              =/  [[* * value-content=@t] *]  (pop:om-hist:f medits)
              ?&  =(0 ~(wyt in (~(dif in author-set) value-author-set)))
                  %+  levy
                    content-list
                  |=(c=tape ?=(^ (find c (cass (trip value-content)))))
              ==
          ==
        =/  tag-set=(set @)  (get-subquery-set %tag)
        ?:  =(0 ~(wyt in tag-set))
          ~
        :*  ~  %s  %r-tags  %|
            |=  =value:n
            ?>  ?=([%s *] value)
            =+  value-tag-set=;;((set @) p.value)
            =(0 ~(wyt in (~(dif in tag-set) value-tag-set)))
        ==
    ^=  sub-queries
    ^-  (list [?(%content %author %tag) @t])
    %+  scan
      (cass (trip query))
    %+  more
      (plus ace)
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
  ::
  ++  pluck  ::  get particular thread
    |=  id=@ud
    ^-  [post:f (list post:f)]
    =/  root-row=post:f  (snag 0 (dump %threads `[%s %l-post-id %& %eq id]))
    =/  root-replies=(set @)  replies:(need thread.root-row)
    :-  root-row
    %+  dump  %posts
    :*  ~  %s  %post-id  %|
        |=  post-id=value:n
        ?>  ?=(@ post-id)
        (~(has in root-replies) post-id)
    ==
  ::
  ++  uproot  ::  get the parent thread (as a post) of a particular post
    |=  id=@ud
    ^-  post:f
    =/  curr-post=post:f  (snag 0 (dump %posts `[%s %post-id %& %eq id]))
    |-
    ^-  post:f
    ?:  =(parent-id.curr-post 0)
      curr-post
    %=    $
        curr-post
      (snag 0 (dump %posts `[%s %post-id %& %eq parent-id.curr-post]))
    ==
  ::
  ++  dumps  :: all db entries (optionally filtered; always threads, only posts if filter)
    |=  [post-filter=(unit condition:n) thread-filter=(unit condition:n)]
    ^-  (list post:f)
    ?>  ?|(?=([~ *] post-filter) ?=([~ *] thread-filter))
    =/  threads=(list post:f)
      %+  dump
        %threads
      ?^  post-filter
        =/  thread-post-filter=condition:n
          =+  cond=(need post-filter)
          |-
          ?-  -.cond
            %n    cond
            %s    cond(c (cat 3 'l-' c.cond))
            %d    cond(c1 (cat 3 'l-' c1.cond), c2 (cat 3 'l-' c2.cond))
            %and  cond(a $(cond a.cond), b $(cond b.cond))
            %or   cond(a $(cond a.cond), b $(cond b.cond))
          ==
        ?^  thread-filter
          `[%and thread-post-filter (need thread-filter)]
        `thread-post-filter
      thread-filter
    =/  thread-ids=(set @)  (silt (turn threads |=(p=post:f post-id.p)))
    =/  posts=(list post:f)
      ?~  post-filter
        ~
      ?^  thread-filter
        ~
      %+  dump
        %posts
      :*  ~  %and  (need post-filter)
          %s  %post-id  %|
          |=  post-id=value:n
          ?>  ?=(@ post-id)
          !(~(has in thread-ids) post-id)
      ==
    (weld threads posts)
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
  ++  sort  ::  sort posts by relevance (i.e. (score, date))
    |=  posts=(list post:f)
    ::  TODO: Consider supporting different ordering schemes, e.g.
    ::  (date, score) for threads (+survey) and (score, date) for
    ::  searches (+search)
    ^-  (list post:f)
    =/  score-post=$-(post:f @sd)
      |=  =post:f
      ^-  @sd
      =-  -.-
      %+  ~(rib by votes.post)
        --0
      |=  [[k=@p v=?(%up %down)] a=@sd]
      :_  [k v]
      (sum:si a ?:(=(v %up) --1 -1))
    =/  date-post=$-(post:f @da)
      |=  =post:f
      ^-  @da
      =/  [[d=@da * *] *]  (pop:om-hist:f history.post)
      d
    %+  ^sort
      posts
    |=  [a=post:f b=post:f]
    =+  ascore=(score-post a)
    =+  bscore=(score-post b)
    =+  abcmp=(cmp:si ascore bscore)
    ?:  !=(abcmp --0)
      =(abcmp --1)
    =+  adate=(date-post a)
    =+  bdate=(date-post b)
    (gth adate bdate)
--  --
