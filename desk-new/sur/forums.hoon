/+  *nectar
=>
  |%
  ::
  +$  edits  ((mop @da ,[who=@p content=@t]) gth)
  ++  om-hist  ((on @da ,[who=@p content=@t]) gth)
  ::
  ::  A schema is a list of [name spot ?optional type]
  ::
  ::
  ++  posts-schema
    :~  [%post-id [0 | %ud]]    :: minimum value is 1, not 0
        [%parent-id [1 | %ud]]  :: required, but 0 means no parent
        [%child-ids [2 | %set]] :: (set @ud)
        [%votes [3 | %map]]     :: (map @p ?(%up %down))
        [%history [4 | %blob]]  :: (mop @da [who=@p content=@t])
    ==

  ++  threads-schema
    :~  [%post-id [0 | %ud]]
        [%reply-ids [1 | %set]]
        [%title [2 | %t]]
        [%tags [3 | %set]]
    ==
  ::
  ::
  ::
  +$  metadata
    $:  name=term
        display-name=@t
        description=@t
        channel=path
        allowed-tags=(set term)
        next-id=@ud
    ==
  ::
  +$  post
    $:  post-id=@
        parent-id=@
        child-ids=[%s p=(set @)]
        votes=[%m p=(map @p term)]
        history=[%b p=edits]
        ~
    ==
  ::
  +$  thread  :: threads are also posts
    $:  post-id=@
        reply-ids=[%s p=(set @)]
        title=@t
        tags=[%s p=(set term)]
        ~
    ==
  ::  Action to a remote board
  +$  poke-forums  [host=@p =forums-action]
  ::
  +$  forums-action
    %+  pair  board=term
    $%  [%new-board display-name=@t channel=path description=@t tags=(list term)]
        [%delete-board ~]
        [%new-thread title=@t content=@t tags=(list term)]
        [%new-reply parent-id=@ content=@t]
        [%new-comment parent-id=@ content=@t]
        [%vote post-id=@ dir=?(%up %down)]
        [%delete-post post-id=@]
        [%edit-board description=(unit @t) tags=(unit (list term))]
        [%edit-content post-id=@ content=@t]
        [%edit-thread-tags post-id=@ tags=(list term)]
        :: [%edit-post post-id=@ content=@t]
        :: [%edit-thread post-id=@ content=(unit @t) title=(unit @t) tags=(unit (list term))]
        [%placeholder ~]  :: to avoid mint vain errors with ?+
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
            primary-key=~[%post-id]
          ::  <litlep> TODO: Figure out what to set index parameters to
          %-  make-indices
          ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]]
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
      =.  metadata.rock  [board display-name.act description.act channel.act (silt tags.act) 1]
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
      =/  tagset=(set term)  (silt tags.act)
      ?.  (are-tags-valid tagset allowed-tags.metadata.rock)
        ~|('%forums: attempting to add one or more disallowed tags' !!)
      ::  Insert a new entry into threads
      =.  database.rock
        =/  new-thread=thread
        :~  next-id.metadata.rock  [%s ~]
            title.act  [%s tagset]
        ==
        %+  ~(insert-rows db database.rock)
          %forums^thread-table
        ~[new-thread]
      ::  Insert a new entry into posts, update board next ID
      =.  database.rock
        =/  new-post=post
        :~  next-id.metadata.rock  ~
            [%s ~]  [%m ~]
            [%b (put:om-hist *edits now.bowl [src.bowl content.act])]
        ==
        %+  ~(insert-rows db database.rock)
          %forums^post-table
        ~[new-post]
      =.  next-id.metadata.rock  +(next-id.metadata.rock)
      rock
    ::
        %new-reply
      ::  Make sure that the thread exists
      ?<  .=(~ (get-thread database.rock thread-table parent-id.act))
      =/  new-post=post
      :~  next-id.metadata.rock  parent-id.act
          [%s ~]  [%m ~]
          [%b (put:om-hist *edits now.bowl [src.bowl content.act])]
      ==
      ::  Check for repeat post (only one response per author per thread)
      ~|  '%forums: cannot post twice in same thread'
      ?>
      .=  ~
      %+  turn
        =<  -
        %+  ~(q db database.rock)
          %forums
        :+  %select
          post-table
        :+  %and
          [%s %parent-id [%& %eq parent-id.act]]
        :^    %s
            %history
          %|
        |=  =value
        ?>  ?=([%b *] value)
        =+  ;;(edits p.value)
        =/  [[@da author=@p @t] edits]  (pop:om-hist -)
        .=(author src.bowl)
      |=(=row !<(post [-:!>(*post) row]))
      ::  Insert a new entry into posts table
      =.  database.rock
        %+  ~(insert-rows db database.rock)
          %forums^post-table
        ~[new-post]
      ::  Update thread replies of parent post
      =.  database.rock
      =/  parent-row=thread
        =+  (get-thread database.rock thread-table parent-id.act)
        ?<  .=(~ -)
        =+  (snag 0 -)
        %=    -
            p.reply-ids
          (~(put in p.reply-ids.-) next-id.metadata.rock)
        ==
        %+  ~(update-rows db database.rock)
          %forums^thread-table
        ~[parent-row]
      ::  Update next ID
      =.  next-id.metadata.rock  +(next-id.metadata.rock)
      rock
    ::
        %new-comment
      ::  Make sure that the thread exists
      ?<  .=(~ (get-thread database.rock thread-table parent-id.act))
      =/  new-post=post
      :~  next-id.metadata.rock  parent-id.act
          [%s ~]  [%m ~]
          [%b (put:om-hist *edits now.bowl [src.bowl content.act])]
      ==
      ::  Update comments section of parent post if applicable
      =.  database.rock
        %+  ~(insert-rows db database.rock)
        %forums^post-table  ~[new-post]
      =.  database.rock
      =/  parent-row=post
        =+  (get-post database.rock post-table parent-id.act)
        %=    -
            p.child-ids
          (~(put in p.child-ids.-) next-id.metadata.rock)
        ==
        %+  ~(update-rows db database.rock)
          %forums^post-table
        ~[parent-row]
      ::  Update next ID
      =.  next-id.metadata.rock  +(next-id.metadata.rock)
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
      ::  TODO: Extend this function to remove all orphaned posts (i.e.
      ::  the entire subtree of comments below a post).
      =/  act-post=post  (get-post database.rock post-table post-id.act)
      =/  [[@da author=@p @t] edits]  (pop:om-hist p.history.act-post)
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      ::  ?>  |&  =(author src.bowl)  allow-groups
      ?.  =(author src.bowl)
        ~|('%forums: deletion permissions denied' !!)
      ::
      ::  remove child references to this post in parents (post, thread)
      ::
      =?  database.rock  !=(parent-id.act-post 0)
        =<  +
        %+  ~(q db database.rock)  %forums
        :*  %update  post-table  [%s %post-id [%& %eq parent-id.act-post]]
            :~  :-  %child-ids
                |=  child-ids=value
                ^-  value
                ?>  ?=(%s -.child-ids)
                [%s (~(del in p.child-ids) post-id.act)]
        ==  ==
      =?  database.rock  !=(parent-id.act-post 0)
        =<  +
        %+  ~(q db database.rock)  %forums
        :*  %update  thread-table  [%s %post-id [%& %eq parent-id.act-post]]
            :~  :-  %reply-ids
                |=  reply-ids=value
                ^-  value
                ?>  ?=(%s -.reply-ids)
                [%s (~(del in p.reply-ids) post-id.act)]
        ==  ==
      ::
      ::  remove rows for this post in all relevant databases (post, thread)
      ::
      ::
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)
          %forums
        [%delete thread-table %s %post-id %& %eq post-id.act]
      =.  database.rock
        =<  +
        %+  ~(q db database.rock)
          %forums
        [%delete post-table %s %post-id %& %eq post-id.act]
      rock
    ::
        %edit-content
      ::  TODO:
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      ::  Look at steps outlined in %delete-post for guidance...
      =/  act-post=post  (get-post database.rock post-table post-id.act)
      =/  [[@da author=@p @t] edits]  (pop:om-hist p.history.act-post)
      ?.  =(author src.bowl)
        ~|('%forums: edit permissions denied' !!)
      :-  metadata.rock
      =<  +
      %+  ~(q db database.rock)
        %forums
      :*  %update  post-table  [%s %post-id [%& %eq post-id.act]]
          :~  :-  %history
              |=  history=value
              ^-  value
              ?>  ?=([%b *] history)
              =+  ;;(edits p.history)
              [%b (put:om-hist - now.bowl [src.bowl content.act])]
      ==  ==
    ::
        %edit-thread-tags
      ::  TODO:
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      =/  act-post=post  (get-post database.rock post-table post-id.act)
      =/  [[@da author=@p @t] edits]  (pop:om-hist p.history.act-post)
      ?.  =(author src.bowl)
        ~|('%forums: edit permissions denied' !!)
      =/  tagset=(set term)  (silt tags.act)
      ?.  (are-tags-valid tagset allowed-tags.metadata.rock)
        ~|('%forums: attempting to add one or more disallowed tags' !!)
      :-  metadata.rock
      =<  +
      %+  ~(q db database.rock)
        %forums
      :*  %update  thread-table  [%s %post-id [%& %eq post-id.act]]
          :~  :-  %tags
              |=  tags=value
              ^-  value
              [%s tagset]
      ==  ==
    ::
        %edit-board
      ::  TODO:
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is our.bowl OR has the appropriate permissions
      ::  Look at steps outlined in %delete-post for guidance...
      ?>  =(our.bowl src.bowl)
      =?  allowed-tags.metadata.rock  ?=(^ tags.act)
        (silt (need tags.act))
      =?  description.metadata.rock  ?=(^ description.act)
        (need description.act)
      rock
    ==
--
::  helper core
|%
  ++  count-votes
  |=  votes=[%m p=(map @p ?(%up %down))]
  ^-  [term @ud]
  ?>  ?=([%m *] votes)
  =/  votes  p.votes
  =-
    =/  a  ;;(@ud +.-)
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
  ++  are-tags-valid
  |=  [tags=(set term) allowed-tags=(set term)]
  ^-  @f
  =+  len-tags=~(wyt in tags)
  =+  len-allowed=~(wyt in allowed-tags)
  ?|  =(0 len-allowed)
      =(len-tags ~(wyt in (~(int in tags) allowed-tags)))
  ==
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
    [%select table-name [%s %post-id [%& %eq id]]]
  |=  =row
  !<(thread [-:!>(*thread) row])
--
