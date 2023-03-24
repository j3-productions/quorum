/-  *nectar
/+  *nectar
=>
  |%  
  ::
  ::  A schema is a list of [name spot ?optional type]
  :: 
  ++  posts-schema
    :~  [%post-id [0 | %ud]]
        [%thread-id [1 | %ud]]
        [%author [2 | %p]]
        [%timestamp [3 | %da]]  :: time when generated
        [%diffs [4 | %list]]
        [%board [5 | %t]]
    ==
  
  ++  threads-schema
    :~  [%thread-id [0 | %ud]]
        [%timestamp [1 | %da]]  :: time when generated
        [%author [2 | %p]]
    ==
  ::
  ::
  ::
  ++  post
    $:  post-id=@ud
        thread-id=@ud
        author=@p
        timestamp=@da
        diffs=(list @)
        board=@tas
    ==

  ++  thread
    $:  thread-id=@ud
        timestamp=@da
        author=@p
    ==
  --
|%
  ++  name  %board
  +$  rock  database
  +$  wave
    $%  [%new-board name=@tas]
        [%new-thread ~]
        [%new-post ~]
        [%edit-post ~]
        [%delete-post ~]
        [%upvote ~]
        [%downvote ~]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
    ==
  ++  wash
    |=  [=rock =wave]
    ?+  -.wave  !!
        %new-board 
      ::  create a new board keyed under the name
      %+  ~(add-table db rock)
        %qa^name.wave
      ^-  table
      :^    (make-schema threads-schema)
          primary-key=~[%thread-id]
        ::  <litlep> TODO: Figure out what to set index parameters to
        (make-indices ~[[~[%thread-id] primary=& autoincrement=~ unique=& clustered=|]])
      ~
    ==
--