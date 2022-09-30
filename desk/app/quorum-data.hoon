::
::  app/quorum-data
::  thanks to ~sidnym-ladrut for this idea.
::  Storage of shelves.
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
      %noun
    =/  act  !<(shun vase)
    ?+    -.act  (on-poke:default mark vase)
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
      `this(library (~(put by library) our.bowl shelf))
    ::
        %add-question
      =/  =shelf  (~(got by library) our.bowl)
      =/  =board  (~(got by shelf) name.act)
      =|  =thread
      =|  question=poast
      =.  clock.board  +(clock.board)
      =:  title.question  title.act
          body.question  body.act
          id.question  clock.board
          who.question  src.bowl
          date.question  now.bowl
          tags.thread  tags.act
      ==
      =.  poasts.thread  (~(put by poasts.thread) clock.board question)
      =.  threads.board  (put:otm threads.board clock.board thread)
      =.  shelf  (~(put by shelf) name.act board)
      `this(library (~(put by library) our.bowl shelf))
    ::
        %add-answer
      =/  =shelf  (~(got by library) our.bowl)
      =/  =board  (~(got by shelf) name.act)
      =/  =thread  (got:otm threads.board (need parent.act))
      =|  answer=poast
      =.  clock.board  +(clock.board)
      =:  body.answer  body.act
          id.answer  clock.board
          parent.answer  parent.act
          who.answer  src.bowl
          date.answer  now.bowl
      ==
      =.  poasts.thread  (put:opm poasts.thread clock.board answer)
      =.  threads.board  (put:otm threads.board (need parent.act) thread)
      =.  shelf  (~(put by shelf) name.act board)
      `this(library (~(put by library) our.bowl shelf))
    ::
       %vote
      =/  =shelf  (~(got by library) our.bowl)
      =/  =board  (~(got by shelf) name.act)
     `this
    ==
 ==
++  on-watch  on-watch:default
++  on-leave  on-leave:default  
++  on-peek   on-peek:default
++  on-agent  on-agent:default
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  add-poast  42
--
