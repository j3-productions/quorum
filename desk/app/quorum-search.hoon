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
=<
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
  ::
  :: Return:
  :: [%search-update !>(`fe-request`[%search (list [=host =name =id])]])]
  ::
  :: Testing:
  :: =qsur -build-file /=quorum=/sur/quorum/hoon
  :: .^(fe-request.qsur %gx /=quorum-search=/search/board-name/search-query/noun)
  :: .^(json %gx /=quorum-search=/search/board-name/search-query/json)
  ::
  |=  =path
  ^-  (unit (unit cage))
  ::  get boards from client and server (remote and local)
  ::
  =+  local-boards-scry=.^(update %gx /=quorum-server=/all-boards/noun)
  =+  remote-boards-scry=.^(update %gx /=quorum-client=/all-boards/noun)
  ?+  q.local-boards-scry  [~ ~]
    [%client-boards @]
  ?+  q.remote-boards-scry  [~ ~]
    [%client-boards @]
  =+  local-boards=+.q.local-boards-scry 
  =+  remote-boards=+.q.remote-boards-scry
  ::  particular board search: path=[%x %search %board-name @ta]
  ::  general search: path=[%x %search %~ @ta]
  ::
  ?+    path  [~ ~]
      [%x %search @tas @t ~]
    ::  get the search term and test if it's a valid @t and less than 80 characters
    ::
    =+  search-term=+>+<.path
    ?.  (lte (lent (trip search-term)) 80)
      [~ ~]
    ::  if a board is given as argument or not
    ::
    =+  provided-board=+>-.path
    ?~  provided-board
      ::  search all boards
      ::
      =/  result=(list [=host =name =id])  (weld (search-boards-local search-term local-boards) (search-boards-remote search-term remote-boards))
      ``[%search-update !>(`fe-request`[%search result])]
    ::  if the board to search is in local boards, host is our.bowl, return results
    ::
    ?:  (match-boardlist-name provided-board local-boards)
      =/  board-to-search=(unit board)  (get-board provided-board local-boards) 
      =+  searchresult=(search search-term [(need board-to-search) ~] %both %exact %newest)
      =+  result=(turn searchresult |=(b=[=name =id] [our.bowl name.b id.b]))
      ``[%search-update !>(`fe-request`[%search result])]
    ::  if the board to search is in remote boards, get the host and return results
    ?:  (match-boardlist-name provided-board remote-boards)
      =/  board-to-search=(unit board)  (get-board provided-board remote-boards) 
      =+  boardhost=(get-host-board provided-board remote-boards)
      =+  searchresult=(search search-term [(need board-to-search) ~] %both %exact %newest)
      =+  result=(turn searchresult |=(b=[=name =id] [boardhost name.b id.b]))
      ``[%search-update !>(`fe-request`[%search result])]
    ::  otherwise invalid board, return null
    ::
    [~ ~]
  ==
  ==
  ==
  

++  on-agent  on-agent:default
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-poke   on-poke:default
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
::
::  helper functions
::
|_  =bowl:gall
  ::  given a board name, return the board
  ::
  ++  get-board
    |=  [=name boardlist=(list [=host boards=(list board)])]
    ^-  (unit board)
    |-
      ?~  boardlist
        ~
      =+  check-in-list=(skim boards.i.boardlist |=(a=board =(name name.board)))
      ?~  check-in-list
        $(boardlist t.boardlist)
      (some -.check-in-list)
  ::  see if a name of a board is in a list of [=host (list board)]
  ::
  ++  match-boardlist-name
    |=  [myname=name boardlist=(list [=host boards=(list board)])]
    |-
      ?~  boardlist
        %.n
      ?:  (lien boards.i.boardlist |=(a=board =(myname name.a)))
        %.y
      $(boardlist t.boardlist)
  ::  given a board name, return the host of the board
  ::
  ++  get-host-board
    |=  [myname=name mylist=(list [=host boards=(list board)])]
    ^-  host
    |-
      ?~  mylist
        `@p`~
      ?:  (lien boards.i.mylist |=(a=board =(myname name.a)))
        host.i.mylist
      $(mylist t.mylist)
  ::  searches boards that are hosted by the user
  ::
  ++  search-boards-local
    |=  [term=@t input=(list [=host boards=(list board)])]
    =+  result=*(list [=host =name =id])
    ^-  (list [=host =name =id])
    |-
      ?~  input
        result
      =+  search-result=(search term boards.i.input %both %exact %newest)
      =+  boardhost=our.bowl
      =+  to-append=(turn search-result |=(b=[=name =id] [boardhost name.b id.b]))
      $(result (weld to-append result), input t.input)
  ::  searches boards hosted by others that user has joined
  ::
  ++  search-boards-remote
    |=  [term=@t input=(list [=host boards=(list board)])]
    =+  result=*(list [=host =name =id])
    ^-  (list [=host =name =id])
    |-
      ?~  input
        result
      =+  search-result=(search term boards.i.input %both %exact %newest)
      =+  boardhost=host.i.input
      =+  to-append=(turn search-result |=(b=[=name =id] [boardhost name.b id.b]))
      $(result (weld to-append result), input t.input)
--   
