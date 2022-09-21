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
  :: [%search-update !>(`update`[now.bowl [%search (list [=host =name =id])]])]
  ::
  :: Testing:
  :: =qsur -build-file /=quorum=/sur/quorum/hoon
  :: .^(fe-request.qsur %gx /=quorum-search=/search/apples/red/noun)
  :: .^(json %gx /=quorum-search=/search/board-name/search-query/json)
  ::
  |=  =path
  ^-  (unit (unit cage))
  ::  get boards from client and server (remote and local)
  ::
  =+  local-boards-scry=.^(update %gx /(scot %p our.bowl)/quorum-server/(scot %da now.bowl)/whose-boards/noun)
  =+  remote-boards-scry=.^(update %gx /(scot %p our.bowl)/quorum-server/(scot %da now.bowl)/whose-boards/noun)
  ?+  +.local-boards-scry  [~ ~]
    [%whose-boards *]
  ?+  +.remote-boards-scry  [~ ~]
    [%whose-boards *]
  =+  local-boards=+.+.local-boards-scry
  =+  remote-boards=+.+.remote-boards-scry
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
    =+  provided-board=`@tas`+>-.path
    ?~  provided-board
      ::  search all boards
      ::
      =/  result=(list [=host =name =id])  (weld (search-boards search-term local-boards) (search-boards search-term remote-boards))
      :^  ~  ~  %server-update
      !>  ^-  update
      [now.bowl [%search result]]
    ::  if the board to search is in local boards, host is our.bowl, return results
    ::
    ?:  (match-boardlist-name provided-board local-boards)
      =/  board-to-search=(unit board)  (get-board provided-board local-boards)
      ::  ?~  board-to-search  [~ ~]
      =+  searchresult=(search search-term [(need board-to-search) ~] %both %exact %newest)
      =+  result=(turn searchresult |=(b=[=name =id] [our.bowl name.b id.b]))
      :^  ~  ~  %server-update
      !>  ^-  update
      [now.bowl [%search result]]
    ::  if the board to search is in remote boards, get the host and return results
    ?:  (match-boardlist-name provided-board remote-boards)
      =/  board-to-search=(unit board)  (get-board provided-board remote-boards)
      ::  ?~  board-to-search  [~ ~]
      =+  boardhost=(get-host-board provided-board remote-boards)
      =+  searchresult=(search search-term [(need board-to-search) ~] %both %exact %newest)
      =+  result=(turn searchresult |=(b=[=name =id] [boardhost name.b id.b]))
      :^  ~  ~  %server-update
      !>  ^-  update
      [now.bowl [%search result]]
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
      =/  check-in-list=(list board)  (skim boards.i.boardlist |=(a=board =(name name.a)))
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
  ::  searches boards and appends the results
  ::
  ++  search-boards
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
