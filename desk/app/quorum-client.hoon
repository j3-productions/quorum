::
::  app/quorum-client
::
/-  *quorum
/+  default-agent, dbug
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 hall=shelf]
+$  card  card:agent:gall
++  otm  ((on id thread) gth)
++  oam  ((on id answer) gth)
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-client initialized successfully'
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
++  on-poke                    :: poke to subscribe to board, send watch task (along with)
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:default mark vase)
      %noun 
    =/  action  !<(?([%sub @p] [%unsub @p]) vase)
    ?-    -.action
        %sub
      :_  this
      :~  [%pass /new %agent [+.action %quorum-server] %watch /updates]
      ==
        %unsub
      :_  this
      :~  [%pass /new %agent [+.action %quorum-server] %leave ~]
      ==
    ==
  ==
::
++  on-watch  on-watch:default
++  on-leave  on-leave:default  
++  on-peek   on-peek:default
++  on-agent  :: respond to updates from server on the above wire
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
::  ?>  =(src.bowl our.bowl)
  ?+    wire  (on-agent:default wire sign)
      [%new ~]
    ?+    -.sign  (on-agent:default wire sign)
        %watch-ack
      ?~  p.sign
        ((slog '%quorum-server: Subscribe succeeded' ~) `this) 
      ((slog '%quorum-server: Subscribe failed' ~) `this)
    ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %update
      ~&  !<(update q.cage.sign)
      `this
      ==
    ==
  ==
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
