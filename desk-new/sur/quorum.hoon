::
::  Yet another Triple J Production
::
::  special thanks to ~wicrun-wicrum and ~hodzod-walrus for walking us
::  through sss and nectar respectively.
::
/-  n=nectar
|%
::
::
+$  flag  (pair ship term)
+$  vote  ?(%up %down)
+$  edits  ((mop @da ,[who=@p content=@t]) gth)
++  om-edits  ((on @da ,[who=@p content=@t]) gth)
::
::
+$  metadata
  $:  board=flag
      group=flag
      title=@t                ::  same as %groups title:meta
      description=@t          ::  same as %groups description:meta
      allowed-tags=(set term)
      next-id=@
  ==
::
+$  board
  $:  =metadata
      =database:n
  ==
::
+$  post
  $:  post-id=@
      parent-id=@
      comments=(set @)
      votes=(map @p vote)
      history=edits
      thread=(unit thread-meta)
      board=flag
      group=flag
  ==
::
+$  thread-meta
  $:  replies=(set @)
      best-id=@
      title=@t
      tags=(set term)
  ==
::
+$  thread
  $:  thread=post
      posts=(list post)
  ==
::
+$  page
  $:  posts=(list post)
      pages=@
  ==
::
::
++  query
  |%
  ::
  +$  param  ?(%content %author %tag)
  +$  token  [param=param check=@t]
  --
::
::
++  table
  |%
  ::
  +$  spec   [name=term schema=(list [term column-type:n])]
  ++  specs  `(list spec)`~[spec:thread spec:post]
  +$  name   ?(%threads %posts)
  ++  names  `(list name)`~[name:thread name:post]
  ::
  ++  post
    |%
    ++  spec  `^spec`[name=name schema=schema]
    ++  name  %posts
    ++  schema
      :~  [%post-id [0 | %ud]]     ::  minimum value is 1
          [%parent-id [1 | %ud]]   ::  0 -> no parent
          [%child-ids [2 | %set]]  ::  (set @ud): comments on the post
          [%votes [3 | %map]]      ::  (map @p vote)
          [%history [4 | %blob]]   ::  (mop @da [who=@p content=@t])
      ==
    --
  ::
  ++  thread
    |%
    ++  spec  `^spec`[name=name schema=schema]
    ++  name  %threads
    ++  schema
      :~  [%post-id [0 | %ud]]     ::  join column for 'posts-schema'
          [%child-ids [1 | %set]]  ::  (set @ud): replies to the thread
          [%best-id [2 | %ud]]     ::  0 -> no best
          [%title [3 | %t]]        ::
          [%tags [4 | %set]]       ::  (set term)
      ==
    --
  --
::
::
+$  action
  (pair flag update)
::
+$  update
  $%  [%new-board group=flag title=@t description=@t tags=(list term)]
      [%edit-board title=(unit @t) description=(unit @t) tags=(unit (list term))]
      [%delete-board ~]
      [%new-thread title=@t tags=(list term) content=@t]
      [%edit-thread post-id=@ best-id=(unit @) title=(unit @t) tags=(unit (list term))]
      [%new-reply parent-id=@ content=@t is-comment=?]
      [%edit-post post-id=@ content=@t]
      [%delete-post post-id=@]
      [%vote post-id=@ dir=vote]
      [%placeholder ~]  :: to avoid mint vain errors with ?+
  ==
::
+$  surf-boards
  $:  ship=@p
      %quorum
      %updates
      host=@p
      board=@tas
      ~
  ==
--
