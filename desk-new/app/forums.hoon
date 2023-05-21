/-  forums
/-  nectar
/+  nectar-lib=nectar
/+  verb, dbug
/+  *sss, *etch

^-  agent:gall
%-  agent:dbug
%+  verb  &
::  listen for subscriptions on [%forums ....]
=/  sub-forums  (mk-subs forums ,[%forums %updates @ ~])
::  publish updates on [%forums %updates @ ~]
=/  pub-forums  (mk-pubs forums ,[%forums %updates @ ~])

=<
|_  =bowl:gall
+*  this  .
    da-forums  =/  da  (da forums ,[%forums %updates @ ~])
                   (da sub-forums bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-forums  =/  du  (du forums ,[%forums %updates @ ~])
                  (du pub-forums bowl -:!>(*result:du))
::
++  on-init  `this
++  on-save  !>([sub-forums pub-forums])
++  on-load
  |=  =vase
  =/  old  !<([=_sub-forums =_pub-forums] vase)
  :-  ~
  %=  this
    sub-forums  sub-forums.old
    pub-forums  pub-forums.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
      %forums-action
    =/  act  !<(forums-action.forums vase)
    ?:  !=(our.bowl p.p.act)
      :_  this
      :~  :*  %pass   /forums/action
              %agent  [p.p.act %forums]
              %poke   %forums-action  vase
      ==  ==
    =^  cards  pub-forums  (give:du-forums [%forums %updates q.p.act ~] [bowl act])
    ::  Prints pub state so that we can observe change caused by poke,
    ::  Comment out line below when releasing.
    ::  ~&  >>>  read:du-forums
    ::  FIXME: Store this somewhere in the agent state for use during scries
    =+  forums-rock=read:du-forums
    =.  cards  (weld cards ~[(~(emit-ui json bowl) act)])
    ::  ~&  >  cards
    [cards this]
  ::
      %surf-forums
    =^  cards  sub-forums
      (surf:da-forums !<(@p (slot 2 vase)) %forums !<([%forums %updates @ ~] (slot 3 vase)))
    [cards this]
  ::
      %sss-on-rock
    `this
  ::
      %quit-forums
    =.  sub-forums
      (quit:da-forums !<(@p (slot 2 vase)) %forums !<([%forums %updates @ ~] (slot 3 vase)))
    ::  ~&  >  "sub-forums is: {<read:da-forums>}"
    `this
  ::
      %sss-to-pub
    ?-  msg=!<(into:du-forums (fled vase))
        [[%forums *] *]
      =^  cards  pub-forums  (apply:du-forums msg)
      [cards this]
    ==
  ::
      %sss-forums
    =/  res  !<(into:da-forums (fled vase))
    =^  cards  sub-forums  (apply:da-forums res)
    ::  Check for wave, emit wave.
    ?+    type.res  [cards this]
        %scry
      =?    cards
          ?=(%wave what.res)
        (weld cards ~[(~(emit-ui json bowl.wave.res) forums-action.wave.res)])
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
        [~ %sss %on-rock @ @ @ %forums %updates @ ~]
      `this
    ::
        [~ %sss %scry-request @ @ @ %forums %updates @ ~]
      =^  cards  sub-forums  (tell:da-forums |3:wire sign)
      [cards this]
    ==
  ==

::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
    ?+    wire  `this
    [~ %sss %behn @ @ @ %forums %updates @ ~]  [(behn:da-forums |3:wire) this]
  ==
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ?+    path  [~ ~]
      [%x %boards ~]
    :*  ~  ~  %noun
        !>  ^-  (list metadata:forums)
        ::  FIXME: Improve formatting
        %+  weld
          (turn ~(val by read:du-forums) |=([* =rock:forums] metadata:rock))
        (turn ~(val by read:da-forums) |=([* * =rock:forums] metadata:rock))
    ==
  ::
      [%x %search @ @ ~]
    =/  page-length=@  50
    =/  page=@ud       (rash +>-.path dem)
    =/  query=tape     (trip +>+<.path)  ::  TODO: Need special processing?
    :*  ~  ~  %noun
        !>  ^-  (list [flag:forums flag:forums post:forums])
        %+  scag  page-length
        %+  slag  (mul page page-length)
        ^-  (list [flag:forums flag:forums post:forums])
        %-  zing
        %+  turn
          ^-  (list [flag:forums flag:forums database:forums])
          ::  FIXME: Improve formatting
          %+  weld
            (turn ~(val by read:du-forums) |=([* =rock:forums] [board:metadata:rock group:metadata:rock database:rock]))
          (turn ~(val by read:da-forums) |=([* * =rock:forums] [board:metadata:rock group:metadata:rock database:rock]))
        |=  [board=flag:forums group=flag:forums =database:forums]
        ^-  (list [flag:forums flag:forums post:forums])
        %-  turn
        ::  FIXME: Do two searches per database: one over posts for content, and
        ::  one over threads for titles/tags
        :_  |=(=row:nectar [board group !<(post:forums [-:!>(*post:forums) row])])
        =<  -
        %-  ~(q db.nectar-lib database)
        :*  %forums  %select  (cat 3 q.board '-posts')
            :*  %s  %history  %|
                |=  =value:nectar
                ?>  ?=([%b *] value)
                =+  ;;(edits:forums p.value)
                =/  [[* * content=@t] *]  (pop:om-hist:forums -)
                ::  TODO: Improve the search algorithm used here
                ?=(^ (find (cass query) (cass (trip content))))
            ==
        ==
    ==
  ::
      [%x %board @ @ *]
    =/  board-host=@p    (slav %p +>-.path)
    =/  board-name=term  +>+<.path
    =/  board-pole=*     +>+>.path
    =/  board-path       [%forums %updates board-name ~]
    =/  thread-db-name   (cat 3 board-name '-threads')
    =/  post-db-name     (cat 3 board-name '-posts')
    =/  board-rock=rock:forums
      ?:  =(board-host our.bowl)
        rock:(~(got by read:du-forums) board-path)
      rock:(~(got by read:da-forums) [board-host %forums board-path])
    ?+    board-pole  !!
        [%metadata ~]
      ``[%noun !>(metadata:board-rock)]
    ::
        [%database ~]  ::  FIXME: Remove this debugging endpoint
      :*  ~  ~  %noun
          !>  ^-  [(list thread:forums) (list post:forums)]
          :*  %-  turn
              :_  |=(=row:nectar !<(thread:forums [-:!>(*thread:forums) row]))
              =<  -
              %-  ~(q db.nectar-lib database:board-rock)
              [%forums %select thread-db-name %n ~]
              %-  turn
              :_  |=(=row:nectar !<(post:forums [-:!>(*post:forums) row]))
              =<  -
              %-  ~(q db.nectar-lib database:board-rock)
              [%forums %select post-db-name %n ~]
      ==  ==
    ::
        [%questions @ ~]
      =/  page-length=@  50
      =/  page=@ud       (rash +<.board-pole dem)
      :*  ~  ~  %noun
          !>  ^-  (list thread-post:forums)
          %+  scag  page-length
          %+  slag  (mul page page-length)
          %+  turn
            =<  -
            %-  ~(q db.nectar-lib database:board-rock)
            [%forums %theta-join thread-db-name post-db-name %d %l-post-id %r-post-id %& %eq]
          |=  =row:nectar
          !<  thread-post:forums
          :-  -:!>(*thread-post:forums)
          =+  thread-len=(lent `row:nectar`*thread:forums)
          =+  post-len=(lent `row:nectar`*post:forums)
          (oust [thread-len (sub post-len 2)] row)
      ==
    ::
        [%search @ @ ~]
      :*  ~  ~  %noun
          ::  TODO: Implement
          !>  ^-  (list post:forums)
          ~
      ==
    ::
        [%thread @ ~]
      =/  page=@ud       (rash +>-.path dem)
      :*  ~  ~  %noun
          ::  TODO: Implement
          !>  ^-  [thread-post:forums (list post:forums)]
          [*thread-post:forums ~]
      ==
    ==
  ==
++  on-watch
  |=  =path
  ^-  (quip card:agent:gall _this)
  ?+    path  `this
      [%front-end %updates ~]
    :_  this
    :~  [%give %fact ~ %json !>(*^json)]
    ==
  ==
++  on-leave  _`this
++  on-fail   _`this
--
::  hc: helper core
|%
++  json
  =,  enjs:format
  |_  bol=bowl:gall
  ++  emit
    |=  =forums-action.forums
    ^-  card:agent:gall
    :*  %give
        %fact
        ~[/front-end/updates]
        [%json !>(*^json)]
    ==
  ::
  ++  emit-ui
    ::  For board added or deleted or edited
    |=  =forums-action.forums
    ^-  card:agent:gall
    =/  act  q.forums-action
    =/  board-name  q.p.forums-action
    ::  Sometimes the bol is from the original wave, not from this agent.
    =/  host  our.bol
    =;  jon=^json
      ::  ~&  >  jon
      :*  %give
          %fact
          ~[/quorum/(scot %p host)/(scot %tas board-name)/ui]
          [%json !>(jon)]
      ==
    %-  need
    ::  =-  ~&(- -)
    %-  de-json:html
    %-  crip
    %-  show-json
    ?+    -.act  !!
        %new-board
      !>
      :*  ^=  new-board
          :*  board=(crip "{<p.p.forums-action>}/{<q.p.forums-action>}")
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
      :*  ^=  edit-thread-tags
          :*  post-id=post-id.act
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
      :*  ^=  edit-content
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
