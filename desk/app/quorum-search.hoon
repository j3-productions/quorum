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
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  :: Input Path:
  ::
  :: Particular Board Search: path=[%x %search %board-name @ta]
  :: General Search (All Boards): path=[%x %search %~ @ta]
  ::
  :: Return:
  :: [%search-update !>(`fe-request`[%search [%local (list [=name =id])] [%remote (list [=name =id])]])]
  ::
  :: Testing:
  :: =qsur -build-file /=quorum=/sur/quorum/hoon
  :: .^(fe-request.qsur %gx /=quorum-search=/search/board-name/search-query/noun)
  :: .^(json %gx /=quorum-search=/search/board-name/search-query/json)
  [~ ~]
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
  ::     boards=(scry quorum-client/server /all-boards)
  ::     filter boards by items in 'board-names'
  ::     return (search search-term boards %both %any %newest)
  ::   end
::
++  on-agent  on-agent:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-poke   on-poke:default
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
