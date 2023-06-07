::
::  Yet another Triple J Production
::  special thanks to ~wicrun-wicrum and ~hodzod-walrus for walking us through sss and nectar respectively.
::
|% :: type core
::
+$  flag  (pair ship term)  ::  from /=groups=/sur/groups/hoon
+$  edits  ((mop @da ,[who=@p content=@t]) gth)
++  om-hist  ((on @da ,[who=@p content=@t]) gth)
::
::  A schema is a list of [name spot ?optional type]
::
++  posts-schema
  :~  [%post-id [0 | %ud]]     ::  minimum value is 1, not 0
      [%parent-id [1 | %ud]]   ::  required, but 0 means no parent
      [%child-ids [2 | %set]]  ::  (set @ud): comments on the post
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
      [%best-id [2 | %ud]]     ::  the id of the "best" response; 0 means no best
      [%title [3 | %t]]        ::
      [%tags [4 | %set]]       ::  (set term)
  ==
::
+$  thread-row
  $:  post-id=@
      child-ids=[%s p=(set @)]
      best-id=@
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
      next-id=@
  ==
::
+$  post
  $:  post-id=@
      parent-id=@
      comments=(set @)
      votes=(map @p ?(%up %down))
      history=edits
      thread=(unit thread-meta)
      board=flag
      group=flag
  ==
+$  thread-meta
  $:  replies=(set @)
      best-id=@
      title=@t
      tags=(set term)
  ==
+$  thread
  $:  thread=post
      posts=(list post)
  ==
+$  page
  $:  posts=(list post)
      pages=@
  ==
::
::
::
+$  forums-poke
  %+  pair
    flag
  forums-action

+$  forums-action
  $%  [%new-board group=flag title=@t description=@t tags=(list term)]
      [%edit-board title=(unit @t) description=(unit @t) tags=(unit (list term))]
      [%delete-board ~]
      [%new-thread title=@t tags=(list term) content=@t]
      [%edit-thread post-id=@ best-id=(unit @) title=(unit @t) tags=(unit (list term))]
      [%new-reply parent-id=@ content=@t is-comment=?]
      [%edit-post post-id=@ content=@t]
      [%delete-post post-id=@]
      [%vote post-id=@ dir=?(%up %down)]
      [%placeholder ~]  :: to avoid mint vain errors with ?+
  ==

+$  surf-boards
  $:  ship=@p
      %forums
      %updates
      host=@p
      board=@tas
      ~
  ==
--
