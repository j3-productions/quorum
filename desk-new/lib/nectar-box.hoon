/-  *nectar
/+  *mip, *nectar
|%
++  post-schema
  :~  [%post-id [0 | %ud]]
      [%content [1 | %t]]
  ==
++  thread-schema
  :~  [%post-id [0 | %ud]]
      [%title [1 | %t]]
  ==
::
+$  post    [post-id=@ud content=@t ~]
+$  thread  [post-id=@ud title=@t ~]
::
++  new-db
  |=  n-rows=@ud
  |^  ^-  database
      =/  deebee=database  empty-database
      =.  deebee  (~(insert-rows db deebee) myapp+%posts (create-post-rows n-rows))
      =.  deebee  (~(insert-rows db deebee) myapp+%threads (create-thread-rows n-rows))
      deebee
  ++  create-post-rows
    |=  n=@ud
    ^-  (list row)
    %+  turn  (gulf 1 n)
    |=(r=@ud `row`[post-id=r content=(crip "{<r>}") ~])
  ++  create-thread-rows
    |=  n=@ud
    ^-  (list row)
    %+  turn  (gulf 1 n)
    |=(r=@ud `row`[post-id=r title=(crip "{<r>}") ~])
  ++  empty-database
    =/  deebee=database  *database
    =.  deebee
      %+  ~(add-table db deebee)  myapp+%posts
      ^-  table
      :~  (make-schema post-schema)
          primary-key=~[%post-id]
          (make-indices ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]])
      ==
    =.  deebee
      %+  ~(add-table db deebee)  myapp+%threads
      ^-  table
      :~  (make-schema thread-schema)
          primary-key=~[%post-id]
          (make-indices ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]])
      ==
    deebee
  --
--


:: ++  posts-schema
::   :~  [%post-id [0 | %ud]]
::       [%parent-id [1 & %ud]]
::       [%child-ids [2 | %set]]
::       [%history [3 | %list]]
::       [%votes [4 | %map]]
::   ==
:: ++  threads-schema
::   :~  [%post-id [0 | %ud]]
::       [%reply-ids [1 | %set]]
::       [%title [2 | %t]]
::       [%tags [3 | %list]]
::   ==
:: ++  body-schema
::   :~  [%body-id [0 | %ud]]
::       [%post-id [1 | %ud]]
::       [%timestamp [2 | %da]]
::       [%author [3 | %p]]
::       [%content [4 | %t]]
::   ==
:: ::
:: +$  post
::   $:  post-id=@
::       parent-id=(unit @)
::       child-ids=[%l p=(set @)]
::       history=[%l p=(list @)]
::       votes=[%m p=(map @p term)]
::       ~
::   ==
:: +$  thread
