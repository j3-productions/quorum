::
::  app/quorum-data
::  thanks to ~sidnym-ladrut for this idea.
:: 
::
/-  *quorum
/+  default-agent, dbug
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =library]
+$  card  card:agent:gall
++  otm  ((on id thread) gth)
++  oam  ((on id poast) gth)
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-data initialized successfully'
  `this
++  on-save   
  ^-  vase
  !>(state)
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %0  `this(state old)
  ==
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:default mark vase)
      %action
    =/  act  !<(action vase)
    ?+    -.act  !!
        %add-board
     =.  library  (add-board:hc act)
     `this
    ::
        %add-question
     =.  library  (add-question:hc act)
     `this
    ::
        %add-answer
     =.  library  (add-answer:hc act)
     `this
    ::
        %vote
     =.  library  (vote:hc act)
     `this
    ::
        %set-best
     =.  library  (set-best:hc act)
     `this
    ::
        %sub
     :_  this
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-data] %watch /updates/(scot %tas name.act)]
    ==
    ::
        %unsub
     =/  =shelf  (~(got by library) host.act)                
     =.  shelf  (~(del by shelf) name.act)           
::     :_  this(library (~(put by library) host.act shelf)) 
     :_  this 
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-data] %leave ~]   
     ==
  ==
==
++  on-watch
  |=  =path
  ^-  (quip card _this)
  ?+    path  (on-watch:default path)
      [%updates @ ~] 
    =/  =name  i.t.path
    =/  =shelf  (~(got by library) our.bowl)
    ?.  (~(has by shelf) name)
      ~|  'board {<name.act>} does not exist'  !!
    =/  =board  (~(got by shelf) name)
    :_  this
    :~  [%give %fact ~ %server-update !>(`update`[now.bowl nu-board+[our.bowl name board]])]
    ==
  ==
++  on-leave  on-leave:default  
++  on-peek   on-peek:default
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%nu @ @ ~]
    =/  =name  -.+.+.wire
    =/  host=@p  (slav %p -.+.wire)
    ?+    -.sign  (on-agent:default wire sign)
        %watch-ack
      ?~  p.sign
        ((slog '%quorum-server: Subscribe succeeded' ~) `this) 
      ((slog '%quorum-server: Subscribe failed' ~) `this)
    ::
        %kick
      :_  this
      :~  [%pass wire %agent [host %quorum-data] %watch /updates/(scot %p host)/(scot %tas name)]
      ==
    ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %server-update
      =/  contents  !<(update q.cage.sign)
      =/  boop  q.contents
      ?+  boop  !!
        [%nu-board *]
      =/  =shelf  ?.  (~(has by library) host.boop)  
        *shelf  
      (~(got by library) host.boop)
      =.  shelf  (~(put by shelf) name board.boop)
      `this(library (~(put by library) host.boop shelf))
      ==
     ==
   ==
 ==
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  add-board
  |=  act=action
  ^-  ^library
  ?>  =(our.bowl src.bowl)
  ?>  ?=  [%add-board *]  act
  ~&  >  "Adding board {<name.act>}"
  =/  =shelf
  ?.  (~(has by library) our.bowl)  *shelf  (~(got by library) our.bowl)
  ?:  (~(has by shelf) name.act)
    ~|  'Board named {<name.act>} already exists'  !!
  =|  nu=board
  =:  name.nu   name.act
      desc.nu   desc.act
      tags.nu   tags.act
      image.nu  image.act
  ==
  =.  shelf  (~(put by shelf) name.act nu)
  (~(put by library) our.bowl shelf)
++  add-question
  |=  act=action
  ^-  ^library
  ?>  ?=  [%add-question *]  act
  =/  =shelf  (~(got by library) host.act)
  =/  =board  (~(got by shelf) name.act)
  =|  =thread
  =|  q=question
  =.  clock.board  +(clock.board)
  =:  title.q  title.act
      body.q  body.act
      id.q  clock.board
      who.q  src.bowl
      date.q  now.bowl
      tags.thread  tags.act
  ==
  =.  question.thread  q
  =.  threads.board  (put:otm threads.board clock.board thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) host.act shelf)
++  add-answer
  |=  act=action
  ^-  ^library
  ?>  ?=  [%add-answer *]  act
  =/  =shelf  (~(got by library) host.act)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board (need parent.act))
  ?:  (~(has in toasted.thread) src.bowl)
    ((slog 'You cannot answer twice in the same thread' ~) library)
  =.  toasted.thread  (~(put in toasted.thread) src.bowl)
  =|  a=answer
  =.  clock.board  +(clock.board)
  =:  body.a  body.act
      id.a  clock.board
      parent.a  parent.act
      who.a  src.bowl
      date.a  now.bowl
  ==
  =.  answers.thread  (put:oam answers.thread clock.board a)
  =.  threads.board  (put:otm threads.board (need parent.act) thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) host.act shelf)
++  vote
  |=  act=action
  ^-  ^library
  ?>  ?=  [%vote *]  act
  =/  =shelf  (~(got by library) host.act)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board thread-id.act)
  =/  =poast 
  ?:  =(thread-id.act post-id.act)
    question.thread
  (got:oam answers.thread post-id.act)
  ?:  (~(has in zooted.poast) src.bowl)
    ((slog 'You cannot vote twice' ~) library)
  =.  zooted.poast  (~(put in zooted.poast) src.bowl)
  ::
  ::  increment / decrement the post
  ::
  =.  votes.poast
    ?-  sing.act
      %up  (sum:si votes.poast --1)
      %down  (dif:si votes.poast --1)
    ==
  ::
  ::  modify thread, reinsert
  ::
  =.  thread  
  ?:  =(thread-id.act post-id.act)
    =.  question.thread  poast  thread
  =.  answers.thread  (put:oam answers.thread post-id.act poast)  thread
  =.  threads.board  (put:otm threads.board thread-id.act thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) host.act shelf)
  ::
++  set-best
  |=  act=action
  ^-  ^library
  ?>  ?=  [%set-best *]  act
  =/  =shelf  (~(got by library) host.act)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board thread-id.act)
  =.  best.thread  (some post-id.act)
  =.  threads.board  (put:otm threads.board thread-id.act thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) host.act shelf)
--
