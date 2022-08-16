::
::  app/quorum-server
::
::  scry endpoints
::
::    [%x %gimme ~]
::  .^((list @tas) %gx /=quorum-server=/gimme/noun)
::
::    [%x %what-board ~]
::  .^(json %gx /=quorum-server=/what-boards/json)
::
/-  *quorum
/+  default-agent, dbug
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =shelf =log]
+$  card  card:agent:gall
++  otm  ((on id thread) gth)
++  oam  ((on id answer) gth)
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
  ~&  >  '%quorum-server initialized successfully'
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
++  on-poke   
  |=  [=mark =vase]
  ^-  (quip card _this)
::  ?>  (team:title our.bowl src.bowl)               :: ensure that only our ship or moons can poke
  ?+    mark  (on-poke:default mark vase)
      %server-poke                                    :: poke from server owner
    =/  act  !<(server-action vase)
    ?-  -.act
        %add-board
      ~&  >  "Adding board {<name.act>}"
      ?:  (~(has by shelf) name.act)  
        ~|  'Board named {<name.act>} already exists'  !!
      =|  nu=board
      =:  name.nu   name.act
          desc.nu   desc.act
          tags.nu   tags.act
          image.nu  image.act
      ==
      `this(shelf (~(put by shelf) name.act nu))
   ::
        %remove-board
      `this(shelf (~(del by shelf) name.act))
      ==
  ::
      %client-poke                                     :: poke from board user (JOIE: currently only produces new threads)
    =/  act  !<(client-action vase)
    ?+  -.act  (on-poke:default mark vase) 
        %add-question                                    
      ?.  (~(has by shelf) name:+.act)
        ~|  'board {<name.act>} does not exist'  !!
      =/  target=board  (~(got by shelf) name:+.act)
      =|  nu-q=question 
      =:  id.nu-q     +(clock.target) 
          date.nu-q   now.bowl
          title.nu-q  title:+.act
          body.nu-q   body:+.act
          who.nu-q    src.bowl
          tags.nu-q   tags:+.act
      ==
      ::
      =|  nu-thread=thread
      =.  question.nu-thread  nu-q  
      =.  threadz.target  (put:otm threadz.target +(clock.target) nu-thread)
      =.  clock.target  +(clock.target)
      `this(shelf (~(put by shelf) name:+.act target))
      ::
        %add-answer
      ?.  (~(has by shelf) name:+.act)
        ~|  'board {<name.act>} does not exist'  !!
      =/  target=board  (~(got by shelf) name:+.act)
      =|  nu-ans=answer
      =:  id.nu-ans      +(clock.target) 
          date.nu-ans    now.bowl
          body.nu-ans    body:+.act
          who.nu-ans     src.bowl
          parent.nu-ans  parent:+.act
      ==
      ::
      =/  top=thread  (got:otm threadz.target parent:+.act)
      =.  answerz.top  (put:oam answerz.top +(clock.target) nu-ans)
      =.  threadz.target  (put:otm threadz.target parent:+.act top)
      =.  clock.target  +(clock.target)
      `this(shelf (~(put by shelf) name:+.act target))
      ::
        %upvote
      `this
      ::
        %downvote
      `this
  ==  ==
++  on-arvo   on-arvo:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-peek
 |=  =path
 ^-  (unit (unit cage))
 ?+  path  (on-peek:default path)
      [%x %what-boards ~]
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%boards ~(val by shelf)]]
   ::
      [%x %all-questions @tas ~]
   =/  =name  i.t.t.path
   =/  questions=(list question)
   %-  turn
     :-  (tap:otm threadz:(~(got by shelf) name))
     |=(a=[key=@ val=thread] question.val.a)
   ~&  questions
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%questions questions]]
  ==
++  on-agent  on-agent:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  two  2
--
