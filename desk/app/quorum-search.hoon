::
::  app/quorum-search
::
/-  *quorum
/+  default-agent, dbug, *quorum-search
|%
+$  card  card:agent:gall
:: ++  otm  ((on id thread) gth)
:: ++  oam  ((on id answer) gth)
--
%-  agent:dbug
^-  agent:gall
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-search initialized successfully'
  `this
++  on-save
  ^-  vase
  !>(~)
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  `this
::
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card _this)
  `this
  :: TODO: Expose a poke endpoint implementing the following high-level
  :: procedure:
  ::
  :: given [board-name=(unit @tas), search-term=@t]:
  ::   all-board-names=(weld (scry quorum-client /what-boards) (scry quorum-server /what-boards))
  ::   if board-name is empty then
  ::     board-names=all-board-names
  ::   else
  ::     board-names=(find board-name in all-board-names)
  ::   end
  ::
  ::   if board-names is empty then
  ::     error %no-candidate-boards-exist
  ::   else
  ::     :: It's going to be kinda annoying to try to get board state
  ::     :: from the existing scry endpoints (need to scry for all
  ::     :: questions, then all threads, etc.)... maybe add a new endpoint?
  ::     ::
  ::     :: boards=[(scry quorum-client/server /all-questions/bn) for bn in board-names]
  ::     boards=[(get-board bn) for bn in board-names]
  ::     return (search search-term boards %both %any %newest)
  ::   end
  ::
  :: NOTE: The following is a partial example of `on-poke` behavior.
  ::
  :: ?+    mark  (on-poke:default mark vase)
  ::     %client-pass
  ::   =/  act  !<(client-pass vase)
  ::   ?-    -.act
  ::       %dove
  ::     :_  this
  ::     :~  [%pass /line/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-server] %poke %client-action !>(client-action.act)]
  ::     ==
  ::   ==
  :: ==
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  `this
  :: TODO: May be unnecessary, or may be used to field return queries
  :: from the `%quorum-server` and `%quorum-client` agents.
  ::
  :: NOTE: The following is a partial example of `on-agent` behavior.
  ::
  :: ?+    wire  (on-agent:default wire sign)
  ::     [%nu @ @ ~]
  ::   =/  =name  -.+.+.wire
  ::   =/  host=@p  (slav %p -.+.wire)
  ::   ?+    -.sign  (on-agent:default wire sign)
  ::       %watch-ack
  ::     ?~  p.sign
  ::       ((slog '%quorum-server: Subscribe succeeded' ~) `this)
  ::     ((slog '%quorum-server: Subscribe failed' ~) `this)
  ::   ::
  ::       %kick
  ::     :_  this
  ::     :~  [%pass wire %agent [host %quorum-server] %watch /updates/(scot %p host)/(scot %tas name)]
  ::     ==
  ::   ::
  ::       %fact
  ::     ?+    p.cage.sign  (on-agent:default wire sign)
  ::         %server-update
  ::     =/  contents  !<(update q.cage.sign)
  ::     =/  dump  q.contents
  ::     ?+  dump  !!
  ::       [%nu-board *]
  ::     `this(hall (~(put by hall) name board.dump))
  ::     ::
  ::   ==
  :: ==
::==
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-peek   on-peek:default
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
