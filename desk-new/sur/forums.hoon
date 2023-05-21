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
++  threads-schema
  :~  [%post-id [0 | %ud]]     ::  join column for 'posts-schema'
      [%child-ids [1 | %set]]  ::  (set @ud); top-level replies to the thread
      [%title [2 | %t]]        ::
      [%tags [3 | %set]]       ::  (set term)
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
  $:  post-id=@
      parent-id=@
      child-ids=[%s p=(set @)]
      votes=[%m p=(map @p term)]
      history=[%b p=edits]
      ~
  ==
::
+$  thread  ::  threads are also posts
  $:  post-id=@
      child-ids=[%s p=(set @)]
      title=@t
      tags=[%s p=(set term)]
      ~
  ==
::
+$  thread-post  ::  thread w/ post info
  $:  post-id=@
      child-ids=[%s p=(set @)]
      title=@t
      tags=[%s p=(set term)]
      votes=[%m p=(map @p term)]
      history=[%b p=edits]
      ~
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
|% :: main core (sss lake core)
++  name  %forums
+$  rock  $:(=metadata =database)
+$  wave  $:(=bowl:agent:gall =forums-action)
++  wash
  |=  [=rock =wave]
  =/  act   q.forums-action.wave
  =/  board  p.forums-action.wave
  =/  bowl  bowl.wave
  =/  thread-table  (cat 3 q.board '-threads')
  =/  post-table  (cat 3 q.board '-posts')
  =/  board-tables=(list table-spec)
    ~[[thread-table threads-schema] [post-table posts-schema]]
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
          %+  turn  board-tables
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
          %+  turn  board-tables
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
          :~  [%insert post-table ~[(new-post ~ content.act)]]
              [%insert thread-table ~[(new-thread title.act tagset)]]
          ==
        ==
      ::
          %edit-thread
        ::  TODO:
        ::  1. Scry groups to obtain permissions
        ::  2. Check if src.bowl is author OR has the appropriate permissions
        =/  act-post=post       (got-post post-id.act)
        =/  act-post-author=@p  (get-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit thread-{<post-id.act>}" !!)
        =/  tagset=(set term)  (silt ?~(tags.act `(list term)`~ (need tags.act)))
        ?.  (are-tags-valid tagset)
          =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata.rock))
          ~|("%forums: can't edit thread to have invalid tags {<bad-tags>}" !!)
        :-  metadata.rock
        %-  run-database-query
        :*  %update  thread-table  [%s %post-id %& %eq post-id.act]
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
        =/  parent-post=post  (got-post parent-id.act)  ::  ensure parent post exists
        ?:  &(!is-comment.act (has-author-replied parent-id.act))
          ~|("%forums: user {<src.bowl>} already posted in thread-{<parent-id.act>}" !!)
        %=    rock
            metadata
          metadata.rock(next-id +(next-id.metadata.rock))
        ::
            database
          =/  parent-table=term  ?:(is-comment.act post-table thread-table)
          %-  run-database-queries
          :~  [%insert post-table ~[(new-post `parent-id.act content.act)]]
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
        =/  act-post=post       (got-post post-id.act)
        =/  act-post-author=@p  (get-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit post-{<post-id.act>}" !!)
        :-  metadata.rock
        %-  run-database-query
        :*  %update  post-table  [%s %post-id %& %eq post-id.act]
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
        =/  act-post=post       (got-post post-id.act)
        =/  act-post-author=@p  (get-author act-post)
        ?.  =(act-post-author src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to delete post-{<post-id.act>}" !!)
        :-  metadata.rock
        %-  run-database-queries
        %+  weld
          ^-  (list query)
          :~  [%delete thread-table %s %post-id %& %eq post-id.act]
              [%delete post-table %s %post-id %& %eq post-id.act]
          ==
        ^-  (list query)
        %+  turn  ?:(=(parent-id.act-post 0) ~ ~[post-table thread-table])
        |=  table-name=term
        :*  %update  table-name  [%s %post-id %& %eq parent-id.act-post]
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
        :*  %update  post-table  [%s %post-id %& %eq post-id.act]
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
    =/  parent-thread=thread  (got-thread parent-id)
    =-  ?~(-.- %.n %.y)
    %-  ~(q db database.rock)
    :*  %forums  %select  post-table  %and
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
  ++  new-post
    |=  [parent-id=(unit @ud) content=@t]
    ^-  post
    :~  post-id=next-id.metadata.rock
        parent-id=?^(parent-id (need parent-id) 0)
        child-ids=[%s ~]
        votes=[%m ~]
        history=[%b (put:om-hist *edits now.bowl [src.bowl content])]
    ==
  ::
  ++  new-thread
    |=  [title=@t tags=(set term)]
    ^-  thread
    :~  post-id=next-id.metadata.rock
        child-ids=[%s ~]
        title=title
        tags=[%s tags]
    ==
  ::
  ++  got-post
    |=  id=@
    ^-  post
    =-  ?~  -
          ~|("%forums: unable to find post-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row !<(post [-:!>(*post) row]))
    =<  -
    %+  ~(q db database.rock)  %forums
    [%select post-table %s %post-id %& %eq id]
  ::
  ++  got-thread
    |=  id=@
    ^-  thread
    =-  ?~  -
          ~|("%forums: unable to find thread-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row !<(thread [-:!>(*thread) row]))
    =<  -
    %+  ~(q db database.rock)  %forums
    [%select thread-table %s %post-id %& %eq id]
  ::
  ++  get-author
    |=  =post
    ^-  @p
    =/  [[* author=@p *] *]  (pop:om-hist p.history.post)
    author
  --
--
