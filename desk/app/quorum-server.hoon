/-  *quorum
/+  default-agent, dbug
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =buckets]
+$  card  card:agent:gall
++  orm  ((on name board) gth)
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-server initialized successfully'
  :: =.  state  [%0 *^buckets]
  `this
++  on-save   
  ^-  vase
  !>(state)
++  on-load   on-load:default
++  on-poke   
  |=  [=mark =vase]
  ^-  (quip card _this)
    ?>  (team:title our.bowl src.bowl)  :: ensure that only our ship or moons can poke
  ?.  ?=(%noun mark)  (on-poke:default mark vase)
    =/  act  !<(server-action vase)
    ?-  -.act
       %add-board
    ~&  >  "Adding board {<name.act>} to buckets {<buckets>}"
    `this(buckets (put:orm buckets name.act *board))
       %remove-board
    `this(buckets +:(del:orm buckets name.act))
    ==
++  on-arvo   on-arvo:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-peek   on-peek:default
++  on-agent  on-agent:default
++  on-fail   on-fail:default
--
