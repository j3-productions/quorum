/+  *nectar
|% :: type core
::
+$  flag  (pair ship term)  ::  from /=groups=/sur/groups/hoon
+$  edits  ((mop @da ,[who=@p content=@t]) gth)
++  om-hist  ((on @da ,[who=@p content=@t]) gth)
+$  table-spec  [name=term schema=(list [term column-type])]
::
::  A schema is a list of [name spot ?optional type]
::
++  posts-schema
  :~  [%post-id [0 | %ud]]     ::  minimum value is 1, not 0
      [%parent-id [1 | %ud]]   ::  required, but 0 means no parent
      [%child-ids [2 | %set]]  ::  (set @ud)
      [%votes [3 | %map]]      ::  (map @p ?(%up %down))
      [%history [4 | %blob]]   ::  (mop @da [who=@p content=@t])
  ==
::
+$  post-row
  $:  post-id=@
      parent-id=@
      child-ids=[%s p=(set @)]
      votes=[%m p=(map @p term)]
      history=[%b p=edits]
      ~
  ==
::
++  threads-schema
  :~  [%post-id [0 | %ud]]     ::  join column for 'posts-schema'
      [%child-ids [1 | %set]]  ::  (set @ud); top-level replies to the thread
      [%title [2 | %t]]        ::
      [%tags [3 | %set]]       ::  (set term)
  ==
::
+$  thread-row
  $:  post-id=@
      child-ids=[%s p=(set @)]
      title=@t
      tags=[%s p=(set term)]
      ~
  ==
::
::
::
+$  metadata
  $:  board=flag
      group=flag
      title=@t                ::  same as %groups title:meta...?
      description=@t          ::  same as %groups description:meta...?
      allowed-tags=(set term)
      next-id=@ud
  ==
::
+$  post
  $:  board=flag
      group=flag
      post-id=@
      parent-id=@
      comments=(set @)
      votes=(map @p ?(%up %down))
      history=edits
      thread=(unit thread-meta)
  ==
+$  thread-meta
  $:  replies=(set @)
      title=@t
      tags=(set term)
  ==
::
::
::
+$  forums-action
  %+  pair  flag
  $%  [%new-board group=flag title=@t description=@t tags=(list term)]
      [%edit-board title=(unit @t) description=(unit @t) tags=(unit (list term))]
      [%delete-board ~]
      [%new-thread title=@t tags=(list term) content=@t]
      [%edit-thread post-id=@ title=(unit @t) tags=(unit (list term))]
      [%new-reply parent-id=@ content=@t is-comment=?]
      [%edit-post post-id=@ content=@t]
      [%delete-post post-id=@]
      [%vote post-id=@ dir=?(%up %down)]
      [%placeholder ~]  :: to avoid mint vain errors with ?+
  ==
--
|% :: helper core
++  via
  |_  [=metadata =database]
  ++  survey  ::  get all threads
    |-
    ^-  (list post)
    (dump %threads ~)
  ::
  ++  search  ::  search all posts matching thread
    |=  query=@t
    ^-  (list post)
    =/  cquery=tape  (cass (trip query))
    ::  TODO: Do a combined search over threads and posts and include
    ::  both types of entry in the result.
    %+  dump  %posts
    :*  ~  %s  %history  %|
        |=  =value
        ?>  ?=([%b *] value)
        =+  ;;(edits p.value)
        =/  [[* * content=@t] *]  (pop:om-hist -)
        ::  TODO: Improve the search algorithm used here
        ?=(^ (find cquery (cass (trip content))))
    ==
  ::
  ++  pluck  ::  get particular thread
    |=  id=@ud
    ^-  [post (list post)]
    =/  root-row=post  (snag 0 (dump %threads `[%s %l-post-id %& %eq id]))
    =/  root-replies=(set @)  replies:(need thread.root-row)
    :-  root-row
    %+  dump  %posts
    :*  ~  %s  %post-id  %|
        |=  post-id=value
        ?>  ?=(@ post-id)
        (~(has in root-replies) post-id)
    ==

  ::
  ++  dump  ::  db entries by table (optionally filtered)
    |=  [table=?(%posts %threads) filter=(unit condition)]
    ^-  (list post)
    =+  filter-cond=?^(filter (need filter) [%n ~])
    %+  turn
      =<  -
      %+  ~(q db database)  %forums
      ?-    table
          %posts
        [%select %posts filter-cond]
      ::
          %threads
        [%theta-join %posts %threads %and filter-cond [%d %l-post-id %r-post-id %& %eq]]
      ==
    |=  =row
    !<  post
    :-  -:!>(*post)
    ::  FIXME: Find a better way to convert from a list like 'row:nectar' to a
    ::  fixed-length tuple like 'post:forums'.
    :*  board=board.metadata
        group=group.metadata
        post-id=(snag 0 row)
        parent-id=(snag 1 row)
        comments==+(v=(snag 2 row) ?>(?=([%s *] v) p.v))
        votes==+(v=(snag 3 row) ?>(?=([%m *] v) p.v))
        history==+(v=(snag 4 row) ?>(?=([%b *] v) p.v))
        ^=  thread
        ?-    table
            %posts
          ~
        ::
            %threads
          :*  ~
              replies==+(v=(snag 6 row) ?>(?=([%s *] v) p.v))
              title=(snag 7 row)
              tags==+(v=(snag 8 row) ?>(?=([%s *] v) p.v))
          ==
        ==
    ==
  --
--
|% :: main core (sss lake core)
++  name  %forums
+$  rock  $:(=metadata =database)
+$  wave  $:(=bowl:agent:gall =forums-action)
++  wash
  |=  [=rock =wave]
  =/  board=flag                p.forums-action.wave
  =/  act                       q.forums-action.wave
  =/  bowl=bowl:agent:gall      bowl.wave
  ::  NOTE: Removed meta/rock-specific names for boards in order to
  ::  simplify the calling code for the `via` helper core.
  =/  tables=(list table-spec)  ~[[%threads threads-schema] [%posts posts-schema]]
  |^  ?+    -.act  !!
          %new-board
        ::  TODO:  If path is populated, check for groups permissions
        ::  =/  channel=path
        ::    ?>  ?=([%l *] -)  p.channel.act
        ::  ?^  channel
        ::    <<scry groups for permissions>>
        ::    ?:  <<allowed in groups>>  %&  %|
        ::  %&
        ?.  =(our.bowl src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to create board {<board>}" !!)
        %=    rock
            metadata
          [board group.act title.act description.act (silt tags.act) 1]
        ::
            database
          %-  run-database-queries
          %+  turn  tables
          |=  =table-spec
          :+    %add-table
              name.table-spec
          :*  schema=(make-schema schema.table-spec)
              primary-key=~[%post-id]
              indices=(make-indices [~[%post-id] primary=& autoincrement=~ unique=& clustered=|]~)
              records=~
          ==
        ==
      ::
          %edit-board
        ::  TODO:
        ::  1. Scry groups to obtain permissions
        ::  2. Check if src.bowl is our.bowl OR has the appropriate permissions
        ::  Look at steps outlined in %delete-post for guidance...
        ?.  =(our.bowl src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit board {<board>}" !!)
        :_  database.rock
        %=    metadata.rock
            title
          ?:(?=(^ title.act) (need title.act) title.metadata.rock)
        ::
          ::  TODO: Implement editing for groups (i.e. migration of
          ::  group used for permissions)
          ::    group
          ::  ?:(?=(^ group.act) (need group.act) group.metadata.rock)
        ::
            description
          ?:(?=(^ description.act) (need description.act) description.metadata.rock)
        ::
            allowed-tags
          ?:(?=(^ tags.act) (silt (need tags.act)) allowed-tags.metadata.rock)
        ::
        ==
      ::
          %delete-board
        ::  TODO: ADD sss KILL somewhere
        ?.  =(our.bowl src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to delete board {<board>}" !!)
        %=    rock
            metadata
          *metadata
        ::
            database
          %-  run-database-queries
          %+  turn  tables
          |=  =table-spec
          [%drop-table name.table-spec]
        ==
      ::
          %new-thread
        =/  tagset=(set term)  (silt tags.act)
        ?.  (are-tags-valid tagset)
          =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata.rock))
          ~|("%forums: can't add thread with invalid tags {<bad-tags>}" !!)
        %=    rock
            metadata
          metadata.rock(next-id +(next-id.metadata.rock))
        ::
            database
          %-  run-database-queries
          :~  [%insert %posts ~[(new-post-row ~ content.act)]]
              [%insert %threads ~[(new-thread-row title.act tagset)]]
          ==
        ==
      ::
          %edit-thread
        ::  TODO:
        ::  1. Scry groups to obtain permissions
        ::  2. Check if src.bowl is author OR has the appropriate permissions
        =/  act-post=post-row   (got-post-row post-id.act)
        =/  act-post-author=@p  (get-post-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit thread-{<post-id.act>}" !!)
        =/  tagset=(set term)  (silt ?~(tags.act `(list term)`~ (need tags.act)))
        ?.  (are-tags-valid tagset)
          =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata.rock))
          ~|("%forums: can't edit thread to have invalid tags {<bad-tags>}" !!)
        :-  metadata.rock
        %-  run-database-query
        :*  %update  %threads  [%s %post-id %& %eq post-id.act]
            :~  :-  %title
                |=  title=value
                ^-  value
                ?~(title.act title (need title.act))
                :-  %tags
                |=  tags=value
                ^-  value
                ?~(tags.act tags [%s tagset])
        ==  ==
      ::
          %new-reply
        =/  parent-post=post-row  (got-post-row parent-id.act)  ::  ensure parent post exists
        ?:  &(!is-comment.act (has-author-replied parent-id.act))
          ~|("%forums: user {<src.bowl>} already posted in thread-{<parent-id.act>}" !!)
        %=    rock
            metadata
          metadata.rock(next-id +(next-id.metadata.rock))
        ::
            database
          =/  parent-table=term  ?:(is-comment.act %posts %threads)
          %-  run-database-queries
          :~  [%insert %posts ~[(new-post-row `parent-id.act content.act)]]
              :*  %update  parent-table  [%s %post-id %& %eq parent-id.act]
                  :~  :-  %child-ids
                      |=  child-ids=value
                      ^-  value
                      ?>  ?=(%s -.child-ids)
                      [%s (~(put in p.child-ids) next-id.metadata.rock)]
              ==  ==
          ==
        ==
      ::
          %edit-post
        ::  TODO:
        ::  1. Scry groups to obtain permissions
        ::  2. Check if src.bowl is author OR has the appropriate permissions
        ::  Look at steps outlined in %delete-post for guidance...
        =/  act-post=post-row   (got-post-row post-id.act)
        =/  act-post-author=@p  (get-post-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit post-{<post-id.act>}" !!)
        :-  metadata.rock
        %-  run-database-query
        :*  %update  %posts  [%s %post-id %& %eq post-id.act]
            :~  :-  %history
                |=  history=value
                ^-  value
                ?>  ?=([%b *] history)
                =+  ;;(edits p.history)
                [%b (put:om-hist - now.bowl [src.bowl content.act])]
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
        ::  2. Check if src.bowl is author OR has the appropriate permissions
        ::  ?>  |&  =(author src.bowl)  allow-groups
        ::  TODO: Extend this function to remove all orphaned posts (i.e.
        ::  the entire subtree of comments below a post).
        =/  act-post=post-row   (got-post-row post-id.act)
        =/  act-post-author=@p  (get-post-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to delete post-{<post-id.act>}" !!)
        :-  metadata.rock
        %-  run-database-queries
        %+  weld
          ^-  (list query)
          :~  [%delete %threads %s %post-id %& %eq post-id.act]
              [%delete %posts %s %post-id %& %eq post-id.act]
          ==
        ^-  (list query)
        %+  turn  `(list term)`?:(=(parent-id.act-post 0) ~ ~[%posts %threads])
        |=  table=term
        :*  %update  table  [%s %post-id %& %eq parent-id.act-post]
            :~  :-  %child-ids
                |=  child-ids=value
                ^-  value
                ?>  ?=(%s -.child-ids)
                [%s (~(del in p.child-ids) post-id.act)]
        ==  ==
      ::
          %vote
        ::  Vote on a post. Voting twice on a post in the same way results
        ::  in removal of the vote.
        :-  metadata.rock
        %-  run-database-query
        :*  %update  %posts  [%s %post-id %& %eq post-id.act]
            :~  :-  %votes
                |=  votes=value
                ^-  value
                ?>  ?=(%m -.votes)
                :-  %m
                =/  vote  (~(get by p.votes) src.bowl)
                ?^  vote
                  ?:  =((need vote) dir.act)
                    (~(del by p.votes) src.bowl)        :: if same vote exists, remove
                  (~(put by p.votes) src.bowl dir.act)  :: if diff vote exists, change
                (~(put by p.votes) src.bowl dir.act)    :: if no vote, insert
        ==  ==
      ==
  ::
  ++  run-database-query
    |=  =query
    ^-  database
    (run-database-queries ~[query])
  ::
  ++  run-database-queries
    |=  queries=(list query)
    ^-  database
    =-  +:(spin queries database.rock apply-query)
    ^=  apply-query
    |=  [=query =database]
    ^-  [^query ^database]
    =-  [query +.-]
    (~(q db database) %forums query)
  ::
  ++  are-tags-valid
    |=  tags=(set term)
    ^-  @f
    ?|  =(0 ~(wyt in allowed-tags.metadata.rock))
        =(0 ~(wyt in (~(dif in tags) allowed-tags.metadata.rock)))
    ==
  ::
  ++  has-author-replied
    |=  parent-id=@ud
    ^-  @f
    =/  parent-thread=thread-row  (got-thread-row parent-id)
    =-  ?~(-.- %.n %.y)
    %-  ~(q db database.rock)
    :*  %forums  %select  %posts  %and
        :*  %s  %post-id  %|
            |=  =value
            ?>  ?=(@ value)
            (~(has in p.child-ids.parent-thread) value)
        ==
        :*  %s  %history  %|
            |=  =value
            ?>  ?=([%b *] value)
            =+  ;;(edits p.value)
            =/  [[* author=@p *] *]  (pop:om-hist -)
            .=(src.bowl author)
        ==
    ==
  ::
  ++  new-post-row
    |=  [parent-id=(unit @ud) content=@t]
    ^-  post-row
    :~  post-id=next-id.metadata.rock
        parent-id=?^(parent-id (need parent-id) 0)
        child-ids=[%s ~]
        votes=[%m ~]
        history=[%b (put:om-hist *edits now.bowl [src.bowl content])]
    ==
  ::
  ++  new-thread-row
    |=  [title=@t tags=(set term)]
    ^-  thread-row
    :~  post-id=next-id.metadata.rock
        child-ids=[%s ~]
        title=title
        tags=[%s tags]
    ==
  ::
  ++  got-post-row
    |=  id=@
    ^-  post-row
    =-  ?~  -
          ~|("%forums: unable to find post-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row !<(post-row [-:!>(*post-row) row]))
    =<  -
    %+  ~(q db database.rock)  %forums
    [%select %posts %s %post-id %& %eq id]
  ::
  ++  got-thread-row
    |=  id=@
    ^-  thread-row
    =-  ?~  -
          ~|("%forums: unable to find thread-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row !<(thread-row [-:!>(*thread-row) row]))
    =<  -
    %+  ~(q db database.rock)  %forums
    [%select %threads %s %post-id %& %eq id]
  ::
  ++  get-post-author
    |=  =post-row
    ^-  @p
    =/  [[* author=@p *] *]  (pop:om-hist p.history.post-row)
    author
  --
--
