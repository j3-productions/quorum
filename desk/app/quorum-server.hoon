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
+$  state-0  [%0 =shelf]
+$  card  card:agent:gall
++  orm  ((on name board) gth)
++  ocm  ((on id thread) gth)
++  otm  ((on id post) gth)
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
  ?>  (team:title our.bowl src.bowl)               :: ensure that only our ship or moons can poke
  ?+    mark  (on-poke:default mark vase)
      %poke-owner                                    :: poke from server owner
    =/  act  !<(server-action vase)
    ?-  -.act
        %add-board
      ~&  >  "Adding board {<name.act>}"
      `this(shelf (put:orm shelf name.act `board`[name.act description.act *children 0]))
   ::
        %remove-board
      `this(shelf +:(del:orm shelf name.act))
      ==
  ::
      %poke-user                                     :: poke from board user (JOIE: currently only produces new threads)
    =/  act  !<(client-action vase)
    ?+  -.act  (on-poke:default mark vase) 
        %add-post                                    :: update the relevant board to add post
      ?~  (get:orm shelf target.act)
        ~|  'board {<name.act>} does not exist'  !!
      =/  new-post=post  `post`[~ date.act body.act 0 author.act]
      =/  book=board  (got:orm shelf target.act)
      =/  new-content  (put:otm *content +(clock.book) new-post) 
      =/  page=thread  `thread`[new-content title.act ~]
      =:  children.book  (put:ocm children.book +(clock.book) page)
          clock.book  +(clock.book)
      ==
      `this(shelf (put:orm shelf target.act book))
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
       [%x %gimme ~]
    ``noun+!>((keys shelf))
    ::
       [%x %what-boards ~]
    :^  ~  ~  %server-update
    !>  ^-  update 
    [%shelf-metadata (turn (tap:orm shelf) grab-metadata)]
  ==
++  on-agent  on-agent:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  keys  
  |=  dir=^shelf
  ^-  (list @tas)
  =/  result  (turn (tap:orm dir) first) :: convert to @tas
  ~&  result
  result 
++  first
  |=  a=[key=@ val=board]
  ^-  @  key:a
++  grab-metadata :: returns name and description
  |=  a=[=name =board]
  ^-  [=name description=@t]
  [name.a description.board.a]
--
