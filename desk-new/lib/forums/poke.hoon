/-  *forums
/+  n=nectar
|%
+$  table-spec  [name=term schema=(list [term column-type:n])]
++  handle-poke
  |_  [=bowl:gall =metadata =database:n]
  ++  fo
    |=  =forums-poke
    ^-  [=^metadata =database:n]
    =/  board=flag  p.forums-poke
    =/  act=forums-action  q.forums-poke
    =/  tables=(list table-spec)
      ~[[%threads threads-schema] [%posts posts-schema]] 
    ?+    -.act  !!
        %new-board  (new-board:hc act tables board)
        %edit-board  (edit-board:hc act)
        %new-thread  (new-thread:hc act)
        %edit-thread  (edit-thread:hc act)
        %new-reply  (new-reply:hc act)
        %edit-post  (edit-post:hc act)
        %delete-post  (delete-post:hc act tables)
        %vote  (vote:hc act)
    ==
  ++  hc
    =<
    |%
    ++  new-board  
      |=  [act=forums-action tables=(list table-spec) board=flag]
      ^-  [=^metadata =database:n]
      ?>  ?=([%new-board *] act)
      ?.  =(our.bowl src.bowl)
      ~|("%forums: user {<src.bowl>} is not allowed to create board {<board>}" !!)
      :-  ^=  metadata
          [board group.act title.act description.act (silt tags.act) 1]
      ^=  database
      %-  run-database-queries
      %+  turn  
        tables
      |=  =table-spec
      :+  %add-table
        name.table-spec
      :*  schema=(make-schema:n schema.table-spec)
          primary-key=~[%post-id]
          indices=(make-indices:n [~[%post-id] primary=& autoincrement=~ unique=& clustered=|]~)
          records=~
      ==
    :: 
    ++  edit-board
      |=  act=forums-action
      ?>  ?=([%edit-board *] act)
        ?.  =(our.bowl src.bowl)
          ~|("%forums: user {<src.bowl>} is not allowed to edit board {<title.metadata>}" !!)
        :_  database
        %=    metadata
            title
          ?:(?=(^ title.act) (need title.act) title.metadata)
        ::
          ::  TODO: Implement editing for groups (i.e. migration of
          ::  group used for permissions)
          ::    group
          ::  ?:(?=(^ group.act) (need group.act) group.metadata)
        ::
            description
          ?:(?=(^ description.act) (need description.act) description.metadata)
        ::
            allowed-tags
          ?:(?=(^ tags.act) (silt (need tags.act)) allowed-tags.metadata)
        ::
        ==
    ::
    ++  new-thread
      |=  act=forums-action
      ?>  ?=([%new-thread *] act)
      =/  tagset=(set term)  (silt tags.act)
      ?.  (are-tags-valid tagset)
        =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata))
        ~|("%forums: can't add thread with invalid tags {<bad-tags>}" !!)
      ::
      =.  database
        %-  run-database-queries
        :~  [%insert %posts ~[(new-post-row ~ content.act)]]
            [%insert %threads ~[(new-thread-row title.act tagset)]]
        ==
      =.  metadata
        metadata(next-id +(next-id.metadata))
      [metadata database]
    ::
    ++  edit-thread
      |=  act=forums-action
      ?>  ?=([%edit-thread *] act)
      ::  TODO:
      ::  1. Scry groups to obtain permissions
      ::  2. Check if src.bowl is author OR has the appropriate permissions
      =/  act-post=post-row  (got-post-row post-id.act)
      =/  act-thread=thread-row  (got-thread-row post-id.act)
      =/  act-post-author=@p  (get-post-author act-post)
      ?.  =(act-post-author src.bowl)
        ~|  "%forums: user {<src.bowl>} is not allowed to edit thread-{<post-id.act>}"
        !!
      ?.  ?|  =(~ best-id.act)
              (~(has in p.child-ids.act-thread) (need best-id.act))
          ==
        =+  child-ids=~(tap in p.child-ids.act-thread)
        ~|("%forums: can't set best to bad reply {<(need best-id.act)>} (valid replies are {<child-ids>})" !!)
      =/  tagset=(set term)  (silt ?~(tags.act `(list term)`~ (need tags.act)))
      ?.  (are-tags-valid tagset)
        =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata))
        ~|("%forums: can't edit thread to have invalid tags {<bad-tags>}" !!)
      :-  metadata
      %-  run-database-query
      :*  %update  %threads  [%s %post-id %& %eq post-id.act]
          :~  :-  %best-id
              |=  best-id=value:n
              ^-  value:n
              ?^  best-id.act
                ?:  =((need best-id.act) best-id)
                  0                                 :: if same best, remove
                (need best-id.act)                  :: if diff best, change
              best-id                               :: if no best, keep old
              :-  %title
              |=  title=value:n
              ^-  value:n
              ?~(title.act title (need title.act))
              :-  %tags
              |=  tags=value:n
              ^-  value:n
              ?~(tags.act tags [%s tagset])
      ==  ==
    ::
    ++  new-reply
      |=  act=forums-action
      ?>  ?=([%new-reply *] act)
      =/  parent-post=post-row  (got-post-row parent-id.act)  ::  ensure parent post exists
      ?:  &(!is-comment.act (has-author-replied parent-id.act))
        ~|("%forums: user {<src.bowl>} already posted in thread-{<parent-id.act>}" !!)
      =.  database
        =/  parent-table=term  ?:(is-comment.act %posts %threads)
        %-  run-database-queries
        :~  [%insert %posts ~[(new-post-row `parent-id.act content.act)]]
            :*  %update  parent-table  [%s %post-id %& %eq parent-id.act]
                :~  :-  %child-ids
                    |=  child-ids=value:n
                    ^-  value:n
                    ?>  ?=(%s -.child-ids)
                    [%s (~(put in p.child-ids) next-id.metadata)]
            ==  ==
        ==
      =.  metadata
        metadata(next-id +(next-id.metadata))
      ::
      [metadata database]
    ::
    ++  edit-post 
    ::  TODO:
    ::  1. Scry groups to obtain permissions
    ::  2. Check if src.bowl is author OR has the appropriate permissions
    ::  Look at steps outlined in %delete-post for guidance...
      |=  act=forums-action
      ?>  ?=([%edit-post *] act)
      =/  act-post=post-row   (got-post-row post-id.act)
      =/  act-post-author=@p  (get-post-author act-post)
      ?.  =(act-post-author src.bowl)
        ~|("%forums: user {<src.bowl>} is not allowed to edit post-{<post-id.act>}" !!)
      :-  metadata
      %-  run-database-query
      :*  %update  %posts  [%s %post-id %& %eq post-id.act]
          :~  :-  %history
              |=  history=value:n
              ^-  value:n
              ?>  ?=([%b *] history)
              =+  ;;(edits p.history)
              [%b (put:om-hist - now.bowl [src.bowl content.act])]
      ==  ==
    ::
    ++  delete-post
      |=  [act=forums-action tables=(list table-spec)]
      ?>  ?=([%delete-post *] act)
      =/  act-post=post-row   (got-post-row post-id.act)
      =/  act-post-author=@p  (get-post-author act-post)
      ?.  =(act-post-author src.bowl)
        ~|("%forums: user {<src.bowl>} is not allowed to delete post-{<post-id.act>}" !!)
      :-  metadata
      %-  run-database-queries
      %+  weld
        ::  Delete the actual post from the threads and posts tables
        ^-  (list query:n)
        %+  turn  tables
        |=(=table-spec [%delete name.table-spec %s %post-id %& %eq post-id.act])
      ::
      ::  Delete the children of the post.
      ^-  (list query:n)
      %+  weld
        ^-  (list query:n)
        %+  turn
          ?>  ?=(%s -.child-ids.act-post)
          ~(tap in p.child-ids.act-post)
        |=  id=@ud
        ^-  query:n
        [%delete %posts %s %post-id %& %eq id]
      ::
      ::  Check if thread or just a post
      ^-  (list query:n)
      ?:  =(parent-id.act-post 0)
        ::
        ::  Delete the replies of the deleted thread
        =/  act-thread=thread-row  (got-thread-row post-id.act)
        %-  zing 
          ^-  (list (list query:n))
          %+  turn
            ?>  ?=(%s -.child-ids.act-thread)
            ~(tap in p.child-ids.act-thread)
          |=  i=@ud
          ^-  (list query:n)
          %+  weld
            ~[[%delete %posts %s %post-id %& %eq i]]
          ::
          ::  Delete the comments on the replies to the thread
              ^-  (list query:n)
              %+  turn
                =+  po=(got-post-row i)
                ?>  ?=(%s -.child-ids.po)
                ~(tap in p.child-ids.po)
              |=  b=@ud
              ^-  query:n
              [%delete %posts %s %post-id %& %eq b]
        ^-  (list query:n)
        ::
        ::  Remove the post from the child list of its parent
        ::  Parent can be a thread, or another post
        :~  :*  %update  %posts  [%s %post-id %& %eq parent-id.act-post]
                :~  :*  %child-ids
                        |=  child-ids=value:n
                        ^-  value:n
                        ?>  ?=(%s -.child-ids)
                        [%s (~(del in p.child-ids) post-id.act)]
            ==  ==  == 
            :*  %update  %threads  [%s %post-id %& %eq parent-id.act-post]
                ^-  (list [=term func=mod-func:n])
                :~  [%best-id |=(v=value:n ?:(=(v post-id.act) 0 v))]
                    :*  %child-ids
                        |=  child-ids=value:n
                        ^-  value:n
                        ?>  ?=(%s -.child-ids)
                        [%s (~(del in p.child-ids) post-id.act)]
                ==  == 
        ==  ==
    ::
    ++  vote
      ::  Vote on a post. Voting twice on a post in the same way results
      ::  in removal of the vote.
      |=  act=forums-action
      ?>  ?=([%vote *] act)
      :-  metadata
      %-  run-database-query
      :*  %update  %posts  [%s %post-id %& %eq post-id.act]
          :~  :-  %votes
              |=  votes=value:n
              ^-  value:n
              ?>  ?=(%m -.votes)
              :-  %m
              =/  vote  (~(get by p.votes) src.bowl)
              ?^  vote
                ?:  =((need vote) dir.act)
                  (~(del by p.votes) src.bowl)        :: if same vote exists, remove
                (~(put by p.votes) src.bowl dir.act)  :: if diff vote exists, change
              (~(put by p.votes) src.bowl dir.act)    :: if no vote, insert
      ==  ==
    -- 
  |%
    :: helper functions for core logic
    ++  run-database-query
    |=  =query:n
    ^-  database:n
    (run-database-queries ~[query])
    ::
  ++  run-database-queries
    |=  queries=(list query:n)
    ^-  database:n
    +:(spin queries database apply-query)
  ::
  ++  apply-query
    |=  [=query:n deebee=database:n]
    ^-  [query:n database:n]
    =-  [query +.-]
    (~(q db:n deebee) %forums query)
    ::
    ++  are-tags-valid
      |=  tags=(set term)
      ^-  @f
      ?|  =(0 ~(wyt in allowed-tags.metadata))
          =(0 ~(wyt in (~(dif in tags) allowed-tags.metadata)))
      ==
    ::
    ++  has-author-replied
      |=  parent-id=@ud
      ^-  @f
      =/  parent-thread=thread-row  (got-thread-row parent-id)
      =-  ?~(-.- %.n %.y)
      %-  ~(q db:n database)
      :*  %forums  %select  %posts  %and
          :*  %s  %post-id  %|
              |=  =value:n
              ?>  ?=(@ value)
              (~(has in p.child-ids.parent-thread) value)
          ==
          :*  %s  %history  %|
              |=  =value:n
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
      :~  post-id=next-id.metadata
          parent-id=?^(parent-id (need parent-id) 0)
          child-ids=[%s ~]
          votes=[%m ~]
          history=[%b (put:om-hist *edits now.bowl [src.bowl content])]
      ==
    ::
    ++  new-thread-row
      |=  [title=@t tags=(set term)]
      ^-  thread-row
      :~  post-id=next-id.metadata
          child-ids=[%s ~]
          best-id=0
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
      :_  |=(=row:n !<(post-row [-:!>(*post-row) row]))
      =<  -
      %+  ~(q db.n database)  %forums
      [%select %posts %s %post-id %& %eq id]

    ::
    ++  got-thread-row
      |=  id=@
      ^-  thread-row
      =-  ?~  -
            ~|("%forums: unable to find thread-{<id>}" !!)
          i.-
      %-  turn
      :_  |=(=row:n !<(thread-row [-:!>(*thread-row) row]))
      =<  -
      %+  ~(q db.n database)  %forums
      [%select %threads %s %post-id %& %eq id]
    ::
    ++  get-post-author
      |=  =post-row
      ^-  @p
      =/  [[* author=@p *] *]  (pop:om-hist p.history.post-row)
      author
  --
  --
--