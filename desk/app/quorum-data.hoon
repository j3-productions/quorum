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
++  opm  ((on id poast) gth)
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
     =.  state  (handle-action:hc !<(action vase))
      `this
  ==
++  on-watch  on-watch:default
++  on-leave  on-leave:default  
++  on-peek   on-peek:default
++  on-agent  on-agent:default
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  handle-action
  |=  act=action
  ^-  _state
  ?+    -.act  !!
      %add-board
    ?>  =(our.bowl src.bowl)
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
    state(library (~(put by library) our.bowl shelf))
  ::
      %add-question
    =/  =shelf  (~(got by library) host.act)
    =/  =board  (~(got by shelf) name.act)
    =|  =thread
    =|  q=poast
    =.  clock.board  +(clock.board)
    =:  title.q  title.act
        body.q  body.act
        id.q  clock.board
        who.q  src.bowl
        date.q  now.bowl
        tags.thread  tags.act
    ==
    =.  poasts.thread  (~(put by poasts.thread) clock.board q)
    =.  threads.board  (put:otm threads.board clock.board thread)
    =.  shelf  (~(put by shelf) name.act board)
    state(library (~(put by library) host.act shelf))
  ::
      %add-answer
    =/  =shelf  (~(got by library) host.act)
    =/  =board  (~(got by shelf) name.act)
    =/  =thread  (got:otm threads.board (need parent.act))
    ?:  (~(has in toasted.thread) src.bowl)
      ((slog 'You cannot answer twice in the same thread' ~) state)
    =.  toasted.thread  (~(put in toasted.thread) src.bowl)
    =|  a=poast
    =.  clock.board  +(clock.board)
    =:  body.a  body.act
        id.a  clock.board
        parent.a  parent.act
        who.a  src.bowl
        date.a  now.bowl
    ==
    =.  poasts.thread  (put:opm poasts.thread clock.board a)
    =.  threads.board  (put:otm threads.board (need parent.act) thread)
    =.  shelf  (~(put by shelf) name.act board)
    state(library (~(put by library) host.act shelf))
  ::
      %vote
    =/  =shelf  (~(got by library) host.act)
    =/  =board  (~(got by shelf) name.act)
    =/  =thread  (got:otm threads.board thread-id.act)
    =/  =poast  (got:opm poasts.thread post-id.act)
    ?:  (~(has in zooted.poast) src.bowl)
      ((slog 'You cannot vote twice' ~) state)
    =.  zooted.poast  (~(put in zooted.poast) src.bowl)
    =.  votes.poast
      ?-  sing.act
        %up  (sum:si votes.poast --1)
        %down  (dif:si votes.poast --1)
      ==
    =.  poasts.thread  (put:opm poasts.thread post-id.act poast)
    =.  threads.board  (put:otm threads.board thread-id.act thread)
    =.  shelf  (~(put by shelf) name.act board)
    state(library (~(put by library) host.act shelf))
  ::
      %set-best
    =/  =shelf  (~(got by library) host.act)
    =/  =board  (~(got by shelf) name.act)
    =/  =thread  (got:otm threads.board thread-id.act)
    =.  best.thread  (some post-id.act)
    =.  threads.board  (put:otm threads.board thread-id.act thread)
    =.  shelf  (~(put by shelf) name.act board)
    state(library (~(put by library) host.act shelf))
  ==
--
