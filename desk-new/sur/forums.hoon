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
    $%  [%new-board name=term]
        [%delete-board name=term]
        [%new-thread board=term title=@t content=@t tags=(list term)]
        [%new-post board=term thread-id=@ parent-id=(unit @) content=@t]
        [%edit-post board=term post-id=@ content=@t]
        [%delete-post board=term post-id=@]
        [%upvote board=term post-id=@]
        [%downvote board=term post-id=@]
        [%edit-tags board=term tags=(list term)]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
    ==
  --
|%
  ++  name  %forums
  +$  rock  database
  +$  wave  forum-action
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