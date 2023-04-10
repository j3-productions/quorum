/+  *nectar
=>
  |%  
  ::
  ::  A schema is a list of [name spot ?optional type]
  :: 
  ++  boards-schema
    :~  [%name [0 | %t]]
        [%channel [1 | %list]]         ::  something like [%groups %channel-name ~]
        [%description [2 | %t]]
        [%allowed-tags [3 | %list]]
        [%count [4 | %ud]]
    ==
  ++  posts-schema
    :~  [%post-id [0 | %ud]]
        [%thread-id [1 | %ud]]
        [%parent-id [2 & %ud]]  :: if this is a comment on a post, it will have a parent-id
        [%timestamp [3 | %da]]  :: time when generated
        [%author [4 | %p]]
        [%content [5 | %t]]
        [%diffs [6 | %list]]
        [%votes [7 | %map]]     :: map of ships that voted along with the direction
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
  +$  boards
    $:  name=term
        description=@t
        channel=[%l p=path]
        allowed-tags=[%l p=(list term)]
        count=@ud
        ~
    ==
  ::
  +$  post
    $:  post-id=@
        thread-id=@
        parent-id=(unit @)
        timestamp=@da
        author=@p
        content=@t
        diffs=[%l p=(list @)]
        votes=[%m p=(map @p term)]
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
  ::
  +$  forum-action
    %+  pair  board=term
    $%  [%new-board channel=[%l path] description=@t tags=[%l (list term)]]
        [%delete-board ~]
        [%new-thread title=@t content=@t tags=[%l (list term)]]
        [%new-post parent-id=(unit @) content=@t]
        [%delete-post id=@]
        [%vote post-id=@ dir=?(%up %down)]
        [%edit-board name=term tags=[%l (list term)]]
        [%edit-post id=@ content=(unit @t) tags=(unit [%l (list term)])]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
    ==
  --
|%
  ++  name  %forums
  +$  rock  database
  +$  wave  $@(%init-board $:(=bowl:agent:gall =forum-action))
  ++  wash
    |=  [=rock =wave]
    =*  threads  |=(=term (cat 3 term '-threads'))
    =*  posts  |=(=term (cat 3 term '-posts'))
    ?@  wave
      %+  ~(add-table db rock)
      %forums^%boards
      ^-  table
      :^    (make-schema boards-schema)
          primary-key=~[%name]
        ::  <litlep> TODO: Figure out what to set index parameters to
        (make-indices ~[[~[%name] primary=& autoincrement=~ unique=& clustered=|]])
      ~
    =/  act   q.forum-action.wave
    =/  board  p.forum-action.wave
    =/  bowl  bowl.wave
    ?+    -.act  !!
        %new-board 
      ::  create a new board keyed under the name
      =.  rock
        %+  ~(add-table db rock)
          %forums^(threads board)
        ^-  table
        :^    (make-schema threads-schema)
            primary-key=~[%thread-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          (make-indices ~[[~[%thread-id] primary=& autoincrement=~ unique=& clustered=|]])
        ~
        =.  rock
        %+  ~(add-table db rock)
          %forums^(posts board)
        ^-  table
        :^    (make-schema posts-schema)
            primary-key=~[%post-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          (make-indices ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]])
        ~
        %+  ~(insert-rows db rock)
        %forums^%boards  ~[~[board description.act channel.act tags.act 0]]
    ::
        %delete-board
      =.  rock
      =<  +
      %+  ~(q db rock)  %forums  
      [%drop-table (threads board)]
      =.  rock
      =<  +
      %+  ~(q db rock)  %forums  
      [%drop-table (posts board)]
      =<  +
      %+  ~(q db rock)  %forums  
      [%delete %boards [%s %name [%& %eq board]]]
    ::
        %new-thread
      =/  board-row=(list boards)
      %+  turn
         =<  -
         %+  ~(q db rock)
           %forums
         ^-  query
         [%select %boards [%s %name [%& %eq board]]]
      |=  =row 
      !<(boards [-:!>(*boards) row])
      =/  board-row  (snag 0 board-row)
      =/  new-post=post
      :~  count.board-row  count.board-row  ~
          now.bowl  src.bowl  content.act
          [%l ~]  [%m *(map @p term)]
      ==
      ::  Insert a new entry into threads
      =.  rock  
        %+  ~(insert-rows db rock)
          %forums^(threads board)  
        ~[[count.board-row now.bowl src.bowl title.act tags.act]]
      =.  rock
        %+  ~(insert-rows db rock)
        %forums^(posts board)  ~[new-post]
      %+  ~(update-rows db rock)
      %forums^%boards  ~[board-row(count +(count.board-row))]
    ::
        %new-post
      =/  board-row=boards
      %+  snag  0
      %+  turn
         =<  -
         %+  ~(q db rock)
           %forums
         [%select %boards [%s %name [%& %eq board]]]
      |=(=row !<(boards [-:!>(*boards) row]))
      =/  new-post=post
      :~  count.board-row  count.board-row  parent-id.act
          now.bowl  src.bowl  content.act
          [%l ~]  [%m *(map @p term)]
      ==
      ::  Insert a new entry into posts, update counter
      =.  rock
        %+  ~(insert-rows db rock)
        %forums^(posts board)  ~[new-post]
      %+  ~(update-rows db rock)
      %forums^%boards  ~[board-row(count +(count.board-row))]
    ::
        %vote
      ::  =;  a  ~&  >  a  a
      =<  +
      %+  ~(q db rock)  %forums  
      :*  %update  (posts board)  [%s %post-id [%& %eq post-id.act]]
          :~  :-  %votes
              |=  votes=value
              ^-  value
              ?>  ?=(%m -.votes)
              :-  %m  
              (~(put by p.votes) src.bowl dir.act)
      ==  ==
    ::
        %delete-post
      =.  rock
      =<  +
      %+  ~(q db rock)  %forums  
      :*  %delete  (threads board)  
          :+  %and 
              [%s %thread-id [%& %eq id.act]] 
              [%s %author [%& %eq src.bowl]]
      ==
      =<  +
      %+  ~(q db rock)  %forums  
      :*  %delete  (posts board)  
          :+  %and 
            [%s %post-id [%& %eq id.act]] 
          [%s %author [%& %eq src.bowl]]
      ==
    ::
        %edit-post
      ::  Does not edit tags or save diffs.
      =<  +
      %+  ~(q db rock)  %forums  
      :*  %update  (posts board)  [%s %post-id [%& %eq id.act]]
          :~  :-  %content
              |=  content=value
              ^-  value
              ?@(content.act content (need content.act))
      ==  ==
    ==
--