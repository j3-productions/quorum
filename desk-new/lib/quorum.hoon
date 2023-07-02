/-  *quorum
/+  n=nectar
|%
++  apply
  |=  [=board =bowl:gall =action]
  ^-  ^board
  =/  flag=flag   p.action
  =/  upd=update  q.action
  =/  specs=(list table-spec)  ~[[%threads threads-schema] [%posts posts-schema]]
  ?+    -.upd  !!
      %new-board
    ?.  =(our.bowl src.bowl)
      ~|("%quorum: user {<src.bowl>} is not allowed to create board {<flag>}" !!)
    :-  [flag group.upd title.upd description.upd (silt tags.upd) 1]
    %-  ~(apply-all via board)
    %+  turn
      specs
    |=  =table-spec
    :+  %add-table
      name.table-spec
    :*  schema=(make-schema:n schema.table-spec)
        primary-key=~[%post-id]
        indices=(make-indices:n [~[%post-id] primary=& autoincrement=~ unique=& clustered=|]~)
        records=~
    ==
  ::
      %edit-board
    ?.  =(our.bowl src.bowl)
      ~|("%quorum: user {<src.bowl>} is not allowed to edit board {<flag>}" !!)
    :_  database.board
    %=    metadata.board
        title
      (fall title.upd title.metadata.board)
    ::
      ::  TODO: Implement editing for groups (i.e. migration of
      ::  group used for permissions)
      ::    group
      ::  (fall group.upd group.metadata.board)
    ::
        description
      (fall description.upd description.metadata.board)
    ::
        allowed-tags
      ?:(?=(^ tags.upd) (silt (need tags.upd)) allowed-tags.metadata.board)
    ::
    ==
  ::
      %new-thread
    =/  tagset=(set term)  (silt tags.upd)
    ?.  (~(are-tags-valid via board) tagset)
      =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata.board))
      ~|("%quorum: can't add thread with invalid tags {<bad-tags>}" !!)
    ::
    :-  metadata.board(next-id +(next-id.metadata.board))
    %-  ~(apply-all via board)
    :~  [%insert %posts ~[(~(new-post-row via board) ~ content.upd bowl)]]
        [%insert %threads ~[(~(new-thread-row via board) title.upd tagset)]]
    ==
  ::
      %edit-thread
    ::  TODO:
    ::  1. Scry groups to obtain permissions
    ::  2. Check if src.bowl is author OR has the appropriate permissions
    =/  upd-post=post-row  (~(got-post-row via board) post-id.upd)
    =/  upd-thread=thread-row  (~(got-thread-row via board) post-id.upd)
    =/  upd-post-author=@p  (~(get-post-author via board) upd-post)
    ?.  |(=(our.bowl src.bowl) =(upd-post-author src.bowl))
      ~|("%quorum: user {<src.bowl>} is not allowed to edit thread-{<post-id.upd>}" !!)
    ?.  |(=(~ best-id.upd) (~(has in p.child-ids.upd-thread) (need best-id.upd)))
      =+  child-ids=~(tap in p.child-ids.upd-thread)
      ~|("%quorum: can't set best to bad reply {<(need best-id.upd)>} (valid replies are {<child-ids>})" !!)
    =/  tagset=(set term)  (silt ?~(tags.upd `(list term)`~ (need tags.upd)))
    ?.  (~(are-tags-valid via board) tagset)
      =+  bad-tags=~(tap in (~(dif in tagset) allowed-tags.metadata.board))
      ~|("%quorum: can't edit thread to have invalid tags {<bad-tags>}" !!)
    :-  metadata.board
    %-  ~(apply via board)
    :*  %update  %threads  [%s %post-id %& %eq post-id.upd]
        :~  :-  %best-id
            |=  best-id=value:n
            ^-  value:n
            ?^  best-id.upd
              ?:  =((need best-id.upd) best-id)
                0                                 :: if same best, remove
              (need best-id.upd)                  :: if diff best, change
            best-id                               :: if no best, keep old
            :-  %title
            |=  title=value:n
            ^-  value:n
            ?~(title.upd title (need title.upd))
            :-  %tags
            |=  tags=value:n
            ^-  value:n
            ?~(tags.upd tags [%s tagset])
    ==  ==
  ::
      %new-reply
    =/  parent-post=post-row  (~(got-post-row via board) parent-id.upd)  ::  parent post exists
    =/  parent-table=term  ?:(is-comment.upd %posts %threads)
    ?:  &(!is-comment.upd (~(has-author-replied via board) parent-id.upd bowl))
      ~|("%quorum: user {<src.bowl>} already posted in thread-{<parent-id.upd>}" !!)
    :-  metadata.board(next-id +(next-id.metadata.board))
    %-  ~(apply-all via board)
    :~  [%insert %posts ~[(~(new-post-row via board) `parent-id.upd content.upd bowl)]]
        :*  %update  parent-table  [%s %post-id %& %eq parent-id.upd]
            :~  :-  %child-ids
                |=  child-ids=value:n
                ^-  value:n
                ?>  ?=(%s -.child-ids)
                [%s (~(put in p.child-ids) next-id.metadata.board)]
        ==  ==
    ==
  ::
      %edit-post
    ::  TODO:
    ::  1. Scry groups to obtain permissions
    ::  2. Check if src.bowl is author OR has the appropriate permissions
    ::  Look at steps outlined in %delete-post for guidance...
    =/  upd-post=post-row   (~(got-post-row via board) post-id.upd)
    =/  upd-post-author=@p  (~(get-post-author via board) upd-post)
    ?.  |(=(our.bowl src.bowl) =(upd-post-author src.bowl))
      ~|("%quorum: user {<src.bowl>} is not allowed to edit post-{<post-id.upd>}" !!)
    :-  metadata.board
    %-  ~(apply via board)
    :*  %update  %posts  [%s %post-id %& %eq post-id.upd]
        :~  :-  %history
            |=  history=value:n
            ^-  value:n
            ?>  ?=([%b *] history)
            =+  ;;(edits p.history)
            [%b (put:om-hist - now.bowl [src.bowl content.upd])]
    ==  ==
  ::
      %delete-post
    =/  upd-post=post-row   (~(got-post-row via board) post-id.upd)
    =/  upd-post-author=@p  (~(get-post-author via board) upd-post)
    ?.  |(=(our.bowl src.bowl) =(upd-post-author src.bowl))
      ~|("%quorum: user {<src.bowl>} is not allowed to delete post-{<post-id.upd>}" !!)
    :-  metadata.board
    %-  ~(apply-all via board)
    %+  weld
      ::  Delete the updual post from the threads and posts tables
      ^-  (list query:n)
      %+  turn  specs
      |=(=table-spec [%delete name.table-spec %s %post-id %& %eq post-id.upd])
    ::
    ::  Delete the children of the post.
    ^-  (list query:n)
    %+  weld
      ^-  (list query:n)
      %+  turn
        ?>  ?=(%s -.child-ids.upd-post)
        ~(tap in p.child-ids.upd-post)
      |=  id=@ud
      ^-  query:n
      [%delete %posts %s %post-id %& %eq id]
    ::
    ::  Check if thread or just a post
    ^-  (list query:n)
    ?:  =(parent-id.upd-post 0)
      ::
      ::  Delete the replies of the deleted thread
      =/  upd-thread=thread-row  (~(got-thread-row via board) post-id.upd)
      %-  zing
        ^-  (list (list query:n))
        %+  turn
          ?>  ?=(%s -.child-ids.upd-thread)
          ~(tap in p.child-ids.upd-thread)
        |=  i=@ud
        ^-  (list query:n)
        %+  weld
          ~[[%delete %posts %s %post-id %& %eq i]]
        ::
        ::  Delete the comments on the replies to the thread
            ^-  (list query:n)
            %+  turn
              =+  po=(~(got-post-row via board) i)
              ?>  ?=(%s -.child-ids.po)
              ~(tap in p.child-ids.po)
            |=  b=@ud
            ^-  query:n
            [%delete %posts %s %post-id %& %eq b]
      ^-  (list query:n)
      ::
      ::  Remove the post from the child list of its parent
      ::  Parent can be a thread, or another post
      :~  :*  %update  %posts  [%s %post-id %& %eq parent-id.upd-post]
              :~  :*  %child-ids
                      |=  child-ids=value:n
                      ^-  value:n
                      ?>  ?=(%s -.child-ids)
                      [%s (~(del in p.child-ids) post-id.upd)]
          ==  ==  ==
          :*  %update  %threads  [%s %post-id %& %eq parent-id.upd-post]
              ^-  (list [=term func=mod-func:n])
              :~  [%best-id |=(v=value:n ?:(=(v post-id.upd) 0 v))]
                  :*  %child-ids
                      |=  child-ids=value:n
                      ^-  value:n
                      ?>  ?=(%s -.child-ids)
                      [%s (~(del in p.child-ids) post-id.upd)]
              ==  ==
      ==  ==
  ::
      %vote
    :-  metadata.board
    %-  ~(apply via board)
    :*  %update  %posts  [%s %post-id %& %eq post-id.upd]
        :~  :-  %votes
            |=  votes=value:n
            ^-  value:n
            ?>  ?=(%m -.votes)
            :-  %m
            =/  vote  (~(get by p.votes) src.bowl)
            ?^  vote
              ?:  =((need vote) dir.upd)
                (~(del by p.votes) src.bowl)        :: if same vote exists, remove
              (~(put by p.votes) src.bowl dir.upd)  :: if diff vote exists, change
            (~(put by p.votes) src.bowl dir.upd)    :: if no vote, insert
    ==  ==
  ==
++  via
  |_  board
  ::
  ++  apply
    |=  =query:n
    ^-  database:n
    (apply-all ~[query])
  ::
  ++  apply-all
    |=  queries=(list query:n)
    ^-  database:n
    =<  +
    %^    spin
        queries
      database
    |=  [=query:n db=database:n]
    ^-  [query:n database:n]
    =-  [query ->]
    (~(q db:n db) %quorum query)
  ::
  ++  are-tags-valid
    |=  tags=(set term)
    ^-  @f
    ?|  =(0 ~(wyt in allowed-tags.metadata))
        =(0 ~(wyt in (~(dif in tags) allowed-tags.metadata)))
    ==
  ::
  ++  has-author-replied
    |=  [parent-id=@ud =bowl:gall]
    ^-  @f
    =/  parent-thread=thread-row  (got-thread-row parent-id)
    =-  ?~(-< %.n %.y)
    %-  ~(q db:n database)
    :*  %quorum  %select  %posts  %and
        :*  %s  %post-id  %|
            |=  =value:n
            ?>  ?=(@ value)
            (~(has in p.child-ids.parent-thread) value)
        ==
        :*  %s  %history  %|
            |=  =value:n
            ?>  ?=([%b *] value)
            =+  ;;(edits p.value)
            =/  edit=(unit [* author=@p *])  (ram:om-hist -)
            ?>  ?=([~ *] edit)
            =(src.bowl author.u.edit)
        ==
    ==
  ::
  ++  new-post-row
    |=  [parent-id=(unit @ud) content=@t =bowl:gall]
    ^-  post-row
    :~  post-id=next-id.metadata
        parent-id=(fall parent-id 0)
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
          ~|("%quorum: unable to find post-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row:n !<(post-row [-:!>(*post-row) row]))
    =<  -
    %+  ~(q db.n database)  %quorum
    [%select %posts %s %post-id %& %eq id]
  ::
  ++  got-thread-row
    |=  id=@
    ^-  thread-row
    =-  ?~  -
          ~|("%quorum: unable to find thread-{<id>}" !!)
        i.-
    %-  turn
    :_  |=(=row:n !<(thread-row [-:!>(*thread-row) row]))
    =<  -
    %+  ~(q db.n database)  %quorum
    [%select %threads %s %post-id %& %eq id]
  ::
  ++  get-post-author
    |=  =post-row
    ^-  @p
    =/  edit=(unit [* author=@p *])  (ram:om-hist p.history.post-row)
    ?>  ?=([~ *] edit)
    author.u.edit
  --
--
