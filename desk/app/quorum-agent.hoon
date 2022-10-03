::
::  app/quorum
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
  ~&  >  '%quorum initialized successfully'
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
++  on-poke                    :: called when modifying local boards and local subs
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:default mark vase)
      %quorum-mail                  :: check that the target board is our.bowl
    =/  act  !<(mail vase)
    ?-    -.act
        %add-question
     :_  this(library (add-question:hc our.bowl src.bowl act))
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl [%forward src.bowl act]])]
     ==
   ::
        %add-answer
     :_  this(library (add-answer:hc our.bowl src.bowl act))
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl [%forward src.bowl act]])]
     ==
   ::
        %vote
     :_  this(library (vote:hc our.bowl src.bowl act))
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl [%forward src.bowl act]])]
     ==
   ::
        %set-best
     :_  this(library (set-best:hc our.bowl src.bowl act))
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl [%forward src.bowl act]])]
     ==
   ==
 ::
      %quorum-outs
    =/  act  !<(outs vase)
    ?+    -.act  !!
        %sub
     :_  this
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-agent] %watch /updates/(scot %tas name.act)]
     ==
  ::
        %unsub
     =/  =shelf  (~(got by library) host.act)                
     =.  shelf  (~(del by shelf) name.act)           
     :_  this(library (~(put by library) host.act shelf)) 
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-agent] %leave ~]   
     ==
  ::
        %dove
      :_  this
      :~  [%pass /line/(scot %p to.act)/(scot %tas name.act) %agent [to.act %quorum-agent] %poke %quorum-mail !>(mail.act)]
      ==
    ==
 ::
      %quorum-beans
    =/  act  !<(beans vase)
    ?+    -.act  !!
        %add-board
     `this(library (add-board:hc our.bowl act))
  ::
        %remove-board
     `this(library (remove-board:hc our.bowl act))
  ::
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
    :~  [%give %fact ~ %update !>(`update`[now.bowl nu-board+[name board]])]
    ==
  ==
++  on-leave  on-leave:default  
++  on-peek
 |=  =path
 ^-  (unit (unit cage))
 ?+  path  (on-peek:default path)
      [%x %boards ~]
   =/  shelves=(list [=host =shelf])  (limo ~(tap by library))
   =/  a=(list [=host boards=(list board)])
   %-  turn  
   :-  shelves  
       |=([=host =shelf] [host ~(val by shelf)])
   :^  ~  ~  %update
   !>  ^-  update  
   [now.bowl [%boards a]]
  ::
      [%x %questions @ @ ~]
   =/  =host  (slav %p i.t.t.path)
   =/  =name  i.t.t.t.path
   =/  a=(unit shelf)  (~(get by library) host)
   ?~  a
     [~ ~] 
   =/  =shelf  (need a)
   =/  placard=(list [=question =tags])
   %-  turn
     :-  (tap:otm threads:(~(got by shelf) name))
     |=([key=@ val=thread] [question.val tags.val])
   :^  ~  ~  %update
   !>  ^-  update
   [now.bowl [%questions placard]]
  ::
      [%x %thread @ @ @ ~]
   =/  =host  (slav %p i.t.t.path)
   =/  =name  i.t.t.t.path
   =/  =id  (rash i.t.t.t.t.path dem)
   =/  a=(unit shelf)  (~(get by library) host)
   ?~  a
     [~ ~] 
   =/  =shelf  (need a)
   =/  =thread  (need (get:otm threads:(~(got by shelf) name) id))
   =/  answers=(list answer)
   %-  turn
     :-  (tap:oam answers:thread)
     |=([key=@ val=answer] val)
   :^  ~  ~  %update
   !>  ^-  update
   [now.bowl [%thread question.thread answers best.thread tags.thread]]
  ::
 ==
++  on-agent                     :: updates from remote boards
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%nu @ @ ~]
    =/  =name  -.+.+.wire
    =/  host=@p  src.bowl
    ?+    -.sign  (on-agent:default wire sign)
        %watch-ack
      ?~  p.sign
        ((slog '%quorum: Subscribe succeeded' ~) `this) 
      ((slog '%quorum: Subscribe failed' ~) `this)
    ::
        %kick
      :_  this
      :~  [%pass wire %agent [host %quorum-agent] %watch /updates/(scot %tas name)]
      ==
    ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %update
      =/  contents  !<(update q.cage.sign)
      =/  dee  q.contents
        ?+  dee  !!
            [%nu-board *]
        =/  =shelf  ?.  (~(has by library) src.bowl)  
          *shelf  
        (~(got by library) src.bowl)
        =.  shelf  (~(put by shelf) name board.dee)
        `this(library (~(put by library) src.bowl shelf))
       ::
            [%forward *]
          =/  =from  -.+.dee
          =/  =mail  +.+.dee
          ?-  mail
              [%add-question *]  :: NEED PROVENANCE OF THE POST
            `this(library (add-question:hc src.bowl from mail))
          ::
              [%add-answer *]
            `this(library (add-answer:hc src.bowl from mail))
          ::
              [%vote *]
            `this(library (vote:hc src.bowl from mail))
          ::
              [%set-best *]
            `this(library (set-best:hc src.bowl from mail))
          ==
        ==
      ==
   ==
 ==
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
|_  =bowl:gall                        :: ugly and dense
++  add-board
  |=  [target=@p act=beans]
  ^-  ^library
  ?>  =(our.bowl src.bowl)
  ?>  ?=  [%add-board *]  act
  ~&  >  "Adding board {<name.act>}"
  =/  =shelf
  ?.  (~(has by library) our.bowl)  
    *shelf  
  (~(got by library) our.bowl)
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
++  remove-board
  |=  [target=@p act=beans]
  ^-  ^library
  ?>  =(our.bowl src.bowl)
  ?>  ?=  [%remove-board *]  act
  =/  =shelf  (~(got by library) our.bowl)
  =.  shelf  (~(del by shelf) name.act)
  (~(put by library) our.bowl shelf)
++  add-question
  |=  [target=@p =who act=mail]
  ^-  ^library
  ?>  ?=  [%add-question *]  act
  =/  =shelf  (~(got by library) target)
  =/  =board  (~(got by shelf) name.act)
  =|  =thread
  =|  q=question
  =.  clock.board  +(clock.board)
  =:  title.q  title.act
      body.q  body.act
      id.q  clock.board
      who.q  who
      date.q  now.bowl
      zooted.q  (~(put in zooted.q) who)
      tags.thread  tags.act
  ==
  =.  question.thread  q
  =.  threads.board  (put:otm threads.board clock.board thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) target shelf)
++  add-answer
  |=  [target=@p =who act=mail]
  ^-  ^library
  ?>  ?=  [%add-answer *]  act
  =/  =shelf  (~(got by library) target)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board (need parent.act))
  ?:  (~(has in toasted.thread) who)
    ((slog 'You cannot answer twice in the same thread' ~) library)
  =.  toasted.thread  (~(put in toasted.thread) who)
  =|  a=answer
  =.  clock.board  +(clock.board)
  =:  body.a  body.act
      id.a  clock.board
      parent.a  parent.act
      who.a  who
      date.a  now.bowl
      zooted.a  (~(put in zooted.a) who)
  ==
  =.  answers.thread  (put:oam answers.thread clock.board a)
  =.  threads.board  (put:otm threads.board (need parent.act) thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) target shelf)
++  vote
  |=  [target=@p =who act=mail]
  ^-  ^library 
  ?>  ?=  [%vote *]  act
  =/  =shelf  (~(got by library) target)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board thread-id.act)
  =/  =poast 
  ?:  =(thread-id.act post-id.act)
    question.thread
  (got:oam answers.thread post-id.act)
  ?:  (~(has in zooted.poast) who)
    ((slog 'You cannot vote twice' ~) library)
  =.  zooted.poast  (~(put in zooted.poast) who)
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
  (~(put by library) target shelf)
  ::
++  set-best
  |=  [target=@p =who act=mail]
  ^-  ^library
  ?>  ?=  [%set-best *]  act
  =/  =shelf  (~(got by library) target)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board thread-id.act)
  ?>  =(who.question.thread who)
  =.  best.thread  (some post-id.act)
  =.  threads.board  (put:otm threads.board thread-id.act thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) target shelf)
--
