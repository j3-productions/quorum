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
=<
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-server initialized successfully'
  :: =.  state  [%0 *^buckets]
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
    ?>  (team:title our.bowl src.bowl)  :: ensure that only our ship or moons can poke
  ?.  ?=(%noun mark)  (on-poke:default mark vase)
    =/  act  !<(server-action vase)
    ?-  -.act
       %add-board
    ~&  >  "Adding board {<name.act>}"
    `this(buckets (put:orm buckets name.act *board))
       %remove-board
    `this(buckets +:(del:orm buckets name.act))
    ==
++  on-arvo   on-arvo:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-peek
 |=  =path
  ^-  (unit (unit cage))
  ?+  path  (on-peek:default path)
       [%x %gimme ~]
    ``noun+!>((keys buckets))
  ==
++  on-agent  on-agent:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  two  2
++  keys  
  |=  dir=^buckets
  ^-  (list @tas)
  =/  result  (turn (tap:orm dir) first) :: convert to @tas
  ~&  result
  result 
++  first
  |=  a=[key=@ val=board]
  ^-  @
  key:a
--
