/+  *nectar
=>
  |%  
  ::
  ::  A schema is a list of [name spot ?optional type]
  :: 
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
  ++  post
    $:  post-id=@
        thread-id=@
        parent-id=(unit @)
        timestamp=@da
        author=@p
        content=@t
        diffs=(list @)
        votes=(map @p term)
    ==
  ::
  ++  thread
    $:  thread-id=@ud  :: threads are also posts
        timestamp=@da
        author=@p
        title=@t
        tags=(list term)
    ==
  ::
  ++  forum-action
    %+  pair  ,[when=@da author=@p]
    $%  [%new-board name=term]
        [%delete-board name=term]
        [%new-thread board=term title=@t content=@t tags=(list term)]
        [%new-post board=term parent-id=(unit @) content=@t]
        [%edit-post board=term post-id=@ content=@t]
        [%delete-post board=term post-id=@]
        [%vote board=term post-id=@ dir=?(%up %down)]
        [%edit-tags board=term tags=(list term)]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
    ==
  --
|%
  ++  name  %forums
  +$  rock  $:(counter=(map term @ud) database=database)
  +$  wave  forum-action
  ++  wash
    |=  [=rock =wave]
    ?+    -.q.wave  !!
        %new-board 
      ::  create a new board keyed under the name
      =/  threads  (cat 3 name.q.wave '-threads')
      =/  posts  (cat 3 name.q.wave '-posts')
      =.  counter.rock  (~(put by counter.rock) name.q.wave 0)
      =.  database.rock
        %+  ~(add-table db database.rock)
          %forums^threads
        ^-  table
        :^    (make-schema threads-schema)
            primary-key=~[%thread-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          (make-indices ~[[~[%thread-id] primary=& autoincrement=~ unique=& clustered=|]])
        ~
      :-  counter.rock
      %+  ~(add-table db database.rock)
        %forums^posts
      ^-  table
      :^    (make-schema posts-schema)
          primary-key=~[%post-id]
        ::  <litlep> TODO: Figure out what to set index parameters to
        (make-indices ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]])
      ~
    ::
        %new-thread
      =/  threads  (cat 3 board.q.wave '-threads')
      =/  posts  (cat 3 board.q.wave '-posts')
      =/  count  (~(got by counter.rock) board.q.wave)
      =/  new-post 
      :~  count  count  ~ 
          when.p.wave  author.p.wave  content.q.wave
          ~  [%m *(map @p term)]
      ==
      =.  counter.rock  (~(put by counter.rock) board.q.wave +(count))
      ::  Insert a new entry into threads
      =.  database.rock  
      %+  ~(insert-rows db database.rock)
        %forums^threads  ~[[count when.p.wave author.p.wave title.q.wave [%l tags.q.wave]]]
      ::  Insert a new entry into posts
      :-  counter.rock
      %+  ~(insert-rows db database.rock)
      %forums^posts  ~[new-post]
    ::
        %new-post
      =/  posts  (cat 3 board.q.wave '-posts')
      =/  count  (~(got by counter.rock) board.q.wave)
      =.  counter.rock  (~(put by counter.rock) board.q.wave +(count))
      =/  new-post=row
      :~  count  count  parent-id.q.wave 
          when.p.wave  author.p.wave  content.q.wave
          %n  [%m *(map @p term)]
      ==
      :-  counter.rock
      %+  ~(insert-rows db database.rock)
      %forums^posts  ~[new-post]
    ::
        %vote
      =/  posts  (cat 3 board.q.wave '-posts')
      :-  counter.rock 
      ::  =;  a  ~&  >  a  a
      =<  +
      %+  ~(q db database.rock)  %forums  
      :*  %update  posts  [%s %post-id [%& %eq post-id.q.wave]]
          :~  :-  %votes
              |=  votes=value
              ^-  value
              ?>  ?=(%m -.votes)
              :-  %m  
              (~(put by p.votes) author.p.wave dir.q.wave)
      ==  ==
      ==
--