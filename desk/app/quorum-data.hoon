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
++  on-poke                    :: called when modifying local boards and local subs
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:default mark vase)
      %quorum-mail                  :: check that the target board is our.bowl
    =/  act  !<(mail vase)
    ?-    -.act
        %add-question
     =.  library  (add-question:hc our.bowl src.bowl act)
     :_  this
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl act])]
     ==
    ::
        %add-answer
     =.  library  (add-answer:hc our.bowl src.bowl act)
     :_  this
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl act])]
     ==
    ::
        %vote
     :_  this(library (vote:hc our.bowl src.bowl act))
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl act])]
     ==
    ::
        %set-best
     =.  library  (set-best:hc our.bowl src.bowl act)
     :_  this
     :~  [%give %fact ~[/updates/(scot %tas name.act)] %update !>(`update`[now.bowl act])]
     ==
   ==
    ::
      %outs
    =/  act  !<(outs vase)
    ?-    -.act
        %sub
     :_  this
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-data] %watch /updates/(scot %tas name.act)]
     ==
  ::
        %unsub
     =/  =shelf  (~(got by library) host.act)                
     =.  shelf  (~(del by shelf) name.act)           
     :_  this(library (~(put by library) host.act shelf)) 
     :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-data] %leave ~]   
     ==
        %dove
      :_  this
      :~  [%pass /line/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-data] %poke %quorum-mail !>(mail.act)]
      ==
    ==
   ::
      %quorum-beans
    =/  act  !<(beans vase)
    ?+    -.act  !!
        %add-board
     =.  library  (add-board:hc our.bowl act)
     `this
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
++  on-peek   on-peek:default
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
        ((slog '%quorum-data: Subscribe succeeded' ~) `this) 
      ((slog '%quorum-data: Subscribe failed' ~) `this)
    ::
        %kick
      :_  this
      :~  [%pass wire %agent [host %quorum-data] %watch /updates/(scot %p host)/(scot %tas name)]
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
            [%add-question *]  :: NEED PROVENANCE OF THE POST
        ~&  >  'deeeeee'
        =.  library  (add-question:hc src.bowl dee)
        `this 
            [%add-answer *]
        ~&  >  'deeeeee'
        =.  library  (add-answer:hc src.bowl dee)
        `this 
            [%vote *]
        ~&  >  'deeeeee'
        =.  library  (vote:hc src.bowl dee)
        `this 
            [%set-best *]
        ~&  >  'deeeeee'
        =.  library  (set-best:hc src.bowl dee)
        `this 
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
  ~&  >  src.bowl
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
  ==
  =.  answers.thread  (put:oam answers.thread clock.board a)
  =.  threads.board  (put:otm threads.board (need parent.act) thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) target shelf)
++  vote
  |=  [target=@p =who act=mail]
  ^-  ^library ?>  ?=  [%vote *]  act
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
  :: REMEMBER TO CHECK IF SOURCE IS AUTHOR OF THE BOARD
  =/  =shelf  (~(got by library) target)
  =/  =board  (~(got by shelf) name.act)
  =/  =thread  (got:otm threads.board thread-id.act)
  =.  best.thread  (some post-id.act)
  =.  threads.board  (put:otm threads.board thread-id.act thread)
  =.  shelf  (~(put by shelf) name.act board)
  (~(put by library) target shelf)
--
