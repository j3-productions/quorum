/+  *nectar
=>
  |%
  ::
  +$  edits  ((mop @da ,[who=@p content=@t]) gth)
  ++  om-hist  ((on @da ,[who=@p content=@t]) gth)
  ::
  ::  A schema is a list of [name spot ?optional type]
  :: 
  ++  posts-schema
    :~  [%post-id [0 | %ud]]
        [%thread-id [1 | %ud]]
        [%parent-id [2 & %ud]]
        [%timestamp [3 | %da]]  :: time when poke received
        [%author [4 | %p]]
        [%content [5 | %t]]
        [%comments [6 | %set]]
        [%history [7 | %blob]]
        [%votes [8 | %map]]     :: map of ships that voted along with the direction
        [%editors [9 | %set]]
    ==
  
  ++  threads-schema
    :~  [%thread-id [0 | %ud]]
        [%timestamp [1 | %da]]  :: time when generated
        [%author [2 | %p]]
        [%title [3 | %t]]
        [%tags [4 | %list]]
    ==
  ::
  ::
  ::
  +$  metadata
    $:  name=term
        display-name=@t
        description=@t
        channel=path
        allowed-tags=(list term)
        count=@ud
    ==
  ::
  +$  post
    $:  post-id=@
        thread-id=@
        parent-id=(unit @)
        timestamp=@da
        author=@p
        content=@t
        comments=[%s p=(set @)]
        history=[%b p=edits]                     :: use a mop?
        votes=[%m p=(map @p term)]
        editors=[%s p=(set @p)]
        ~
    ==
  ::
  +$  thread
    $:  thread-id=@ud  :: threads are also posts
        timestamp=@da
        author=@p
        title=@t
        tags=[%l p=(list term)]
        ~
    ==
  ::  Action to a remote board
  +$  poke-forums  [%poke-forums host=@p =forums-action]
  ::
  +$  forums-action
    %+  pair  board=term
    $%  [%new-board display-name=@t channel=[%l p=path] description=@t tags=[%l p=(list term)]]
        [%delete-board ~]
        [%new-thread title=@t content=@t tags=[%l p=(list term)]]
        [%new-reply thread-id=@ parent-id=(unit @) comment=? content=@t]
        [%vote post-id=@ dir=?(%up %down)]
        [%delete-post id=@]
        [%edit-board description=(unit @t) tags=(unit (list term))]
        [%edit-content post-id=@ content=@t]
        [%edit-thread-tags thread-id=@ tags=[%l p=(list term)]]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
    ==
  ::
  ::  Use this poke to scry the groups to obtain text of a post
  ::  After obtaining the text, call %new-thread or %new-reply with text
  +$  groups-action  [%import-from-groups channel=path id=@ as=?(%reply %thread)]
  ::
  +$  forums-update
    $%  [%thread-update ~]
        [%board-update ~]
        [%boards-update ~]
        [%error text=@t]
    ==
  --
=<
|%
  ++  name  %forums
  ::  ...
  ::  you wake up (flawless)
  ::  post up (flawless)
  ::  run around in it (flawless)
  ::  flossin on that (flawless) 
  ::  this diamond (flawless)
  ::  my diamond (flawless)
  ::  this rock (flawless)
  ::  my rock (flawless)
  ::  ...
  +$  rock  $:(=metadata =database)
  +$  wave  $:(=bowl:agent:gall =forums-action)
  ++  wash
    |=  [=rock =wave]
    =/  act   q.forums-action.wave
    =/  board  p.forums-action.wave
    =/  bowl  bowl.wave
    =/  thread-table  (cat 3 board '-threads')
    =/  post-table  (cat 3 board '-posts')
    ?+    -.act  !!
        %new-board 
      ::  TODO:  If path is populated, check for groups permissions
      ::  =/  channel=path
      ::    ?>  ?=([%l *] -)  p.channel.act
      ::  ?^  channel
      ::    <<scry groups for permissions>>
      ::    ?:  <<allowed in groups>>  %&  %|
      ::  %&
      =.  database.rock
        %+  ~(add-table db database.rock)
          %forums^thread-table
        ^-  table
        :^    (make-schema threads-schema)
            primary-key=~[%thread-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          %-  make-indices 
          ~[[~[%thread-id] primary=& autoincrement=~ unique=& clustered=|]]
        ~
      =.  database.rock
        %+  ~(add-table db database.rock)
          %forums^post-table
        ^-  table
        :^    (make-schema posts-schema)
            primary-key=~[%post-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          %-  make-indices 
          ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]]
        ~
      =.  metadata.rock  [board display-name.act description.act channel.act tags.act 0]
      rock
    ::
        %delete-board
      ?>  =(our.bowl src.bowl)
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)  
          %forums  
        [%drop-table thread-table]
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)
          %forums  
        [%drop-table post-table]
      rock
      :: ADD sss KILL somewhere
    ::
        %new-thread
      ::  Check if tags are allowed
      ?>
        ::  If allowed list is empty, return %.y
        ?~  allowed-tags.metadata.rock
          %&
        ::  Otherwise, check if tags are allowed
        =/  tags  
          ?>  ?=([%l *] tags.act)  p.tags.act 
        %+  levy
          tags
        |=  a=term 
        ?~((find ~[a] allowed-tags.metadata.rock) %| %&)
      ::  Insert a new entry into threads
      =.  database.rock  
        %+  ~(insert-rows db database.rock)
          %forums^thread-table 
        ~[[count.metadata.rock now.bowl src.bowl title.act tags.act]]
      ::  Insert a new entry into posts, update board counter
      =.  database.rock
        =/  new-post=post
        :~  count.metadata.rock  count.metadata.rock  ~
            now.bowl  src.bowl  content.act
            [%s ~]  [%b ~]  [%m ~]  [%s ~]
        ==
        %+  ~(insert-rows db database.rock)
          %forums^post-table  
        ~[new-post]
      =.  count.metadata.rock  +(count.metadata.rock)
      rock
    ::
        %new-reply
      ::  Make sure that the thread exists
      ?<  .=(~ (get-thread database.rock thread-table thread-id.act))
      =/  new-post=post
      :~  count.metadata.rock  thread-id.act  parent-id.act
          now.bowl  src.bowl  content.act
          [%s ~]  [%b ~]  [%m ~]  [%s ~]
      ==
      ::  Check for repeat post
      ?>  ~|  '%forums: cannot post twice in same thread'  
      .=  ~
      %+  turn
        =<  -
        %+  ~(q db database.rock)
          %forums
        :+  %select 
          post-table
        :+  %and 
          [%s %thread-id [%& %eq thread-id.act]]
        [%s %author [%& %eq src.bowl]]
      |=  =row 
      !<(post [-:!>(*post) row])
      ::  Insert a new entry into posts table
      =.  database.rock
        %+  ~(insert-rows db database.rock)
        %forums^post-table  ~[new-post]
      ::  Update comments section of parent post if applicable
      =?  database.rock  comment.act
      ?<  .=(~ parent-id.act)
      =/  parent-row=post
        =+  (get-post database.rock post-table (need parent-id.act))
        %=    -
            p.comments  
          (~(put in p.comments.-) count.metadata.rock)
        ==
        %+  ~(update-rows db database.rock)
          %forums^post-table  
        ~[parent-row]
      ::  Update counter
      =.  count.metadata.rock  +(count.metadata.rock)
      rock
    ::
        %vote
      ::  =;  a  ~&  >  a  a
      ::  Vote on a post. Voting twice on a post results in removal of vote.
      :-  metadata.rock
      =<  +
      %+  ~(q db database.rock)
        %forums  
      :*  %update  post-table  [%s %post-id [%& %eq post-id.act]]
          :~  :-  %votes
              |=  votes=value
              ^-  value
              ?>  ?=(%m -.votes)
              :-  %m  
              ?.  (~(has by p.votes) src.bowl)
                (~(put by p.votes) src.bowl dir.act)
              (~(del by p.votes) src.bowl)
      ==  ==
    ::
        %delete-post
      ::  TODO: 
      ::  1. Scry groups to obtain permissions if channel is not null
      ::  ?~  channel.metadata.rock
      ::    %&
      ::  :: JOIE:  Alias the block below using =* instead of =/
      ::  =/  allow-groups=? 
      ::  ?^  channel 
      ::    <<scry groups for permissions>>
      ::    ?:  <<allowed in groups>>  %&  %|
      ::  %&
      ::  
      =/  author=@p  author:(get-post database.rock post-table id.act)
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      ::  ?>  |&  =(author src.bowl)  allow-groups
      ?>  =(author src.bowl)
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)
          %forums  
        :*  %delete  thread-table
            :+  %and 
              [%s %thread-id [%& %eq id.act]] 
            [%s %author [%& %eq src.bowl]]
        ==
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)
          %forums  
        :*  %delete  post-table
            :+  %and 
              [%s %post-id [%& %eq id.act]] 
            [%s %author [%& %eq src.bowl]]
        ==
      rock
    ::
        %edit-content
      ::  TODO: 
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      ::  Look at steps outlined in %delete-post for guidance...
      =/  author=@p  author:(get-post database.rock post-table post-id.act)
      ?>  =(author src.bowl)
      :-  metadata.rock
      =<  +
      %+  ~(q db database.rock)
        %forums  
      :*  %update  post-table  [%s %post-id [%& %eq post-id.act]]
          :~  :-  %content
              |=  content=value
              ^-  value
              content.act
            ::
              :-  %editors
              |=  editors=value
              ^-  value
              ?>  ?=([%s *] editors)
              ::  Only add to editors if not the author
              ?:  =(author src.bowl)
                editors
              [%s (~(put in p.editors) src.bowl)]
            ::
              :-  %history
              |=  history=value
              ^-  value
              ?>  ?=([%b *] history)
              =+  ;;  ((mop @da ,[who=@p content=@t]) gth)  p.history
              [%b (put:om-hist - now.bowl [src.bowl content.act])]
      ==  ==
    ::
        %edit-thread-tags
      ::  TODO: 
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      =/  author=@p  author:(get-post database.rock post-table thread-id.act)
      ?>  =(author src.bowl)
      ::  Check if tags are allowed
      ?>
        ::  If allowed list is empty, return %.y
        ?~  allowed-tags.metadata.rock
          %&
        ::  Otherwise, check if tags are allowed
        =/  tags  
          ?>  ?=([%l *] tags.act)  p.tags.act 
        %+  levy
          tags
        |=  a=term 
        ?~((find ~[a] allowed-tags.metadata.rock) %| %&)
      :-  metadata.rock
      =<  +
      %+  ~(q db database.rock)
        %forums  
      :*  %update  thread-table  [%s %thread-id [%& %eq thread-id.act]]
          :~  :-  %tags
              |=  tags=value
              ^-  value
              tags.act
      ==  ==
    ::
        %edit-board
      ::  TODO: 
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is our.bowl OR has the appropriate permissions
      ::  Look at steps outlined in %delete-post for guidance...
      ?>  =(our.bowl src.bowl)
      =.  allowed-tags.metadata.rock
        ?~  tags.act
          allowed-tags.metadata.rock 
        (need tags.act)
      =.  description.metadata.rock
        ?~  description.act
          description.metadata.rock
        (need description.act)
      rock
    ==
--
::  helper core
|% 
  :: +count-votes: not tested
  ++  count-votes
  |=  votes=[%m p=(map @p ?(%up %down))]
  ^-  [term @ud]
  ?>  ?=([%m *] votes) 
  =/  votes  p.votes
  =- 
    =/  a  ;;(@ud +)
    ?:  =(0 (mod a 2))
      [%pos (div a 2)]
    [%neg +((div a 2))]
  %^    spin
      ~(tap by votes)
    -0
  |=  [[who=@p dir=?(%up %down)] n=@sd]
  =,  si
  :_  ?:(=(dir %up) (sum n --1) (dif n --1))
  [who dir]
::
  ++  get-post
  ::  Retrieves post row
  |=  [=database table-name=term id=@]
  ^-  post
  =+  %+  turn
      =<  -
      %+  ~(q db database)
        %forums
      ^-  query
      [%select table-name [%s %post-id [%& %eq id]]]
    |=  =row 
    !<(post [-:!>(*post) row])
  ::  Check that query result is not empty
  ?<  .=(~ -)
  (snag 0 -)
::
  ++  get-thread
  ::  Retrieves thread row (without checking if the query result is empty)
  |=  [=database table-name=term id=@]
  ^-  (list thread)
  %+  turn
    =<  -
    %+  ~(q db database)
      %forums
    ^-  query
    [%select table-name [%s %thread-id [%& %eq id]]]
  |=  =row 
  !<(thread [-:!>(*thread) row])
::
  ++  json
  =,  enjs:format
  |%
    ++  emit
    |=  =forums-update
    ^-  card:agent:gall  
    :*  %give  
        %fact  
        ~[/front-end/updates]
        [%json !>(*^json)]
    ==
  --
--