/-  *nectar
/+  *mip, *nectar
|%
+$  generic-row  
  $:  id=@ud
      name=@t
      ~
  ==
+$  drake-row
  $:  id=@ud
      songname=@t
      album=@t
      year=@ud
      ~
  ==
::
++  run-query
  |=  [=database =query]
  %+  turn
  =<  -
    %+(~(q db database) %myapp query)
  |=(=row !<(generic-row [-:!>(*generic-row) row]))
::
++  run-mutation
  |=  [=database =query]
  (~(q db database) %myapp query)
::
++  variable-length-db
  |=  n-rows=@ud
  |^  
  ^-  database 
  =/  deebee=database  empty-database
  %+  ~(insert-rows db deebee) 
    %myapp^%boards  (create-rows n-rows)
  
  ++  create-rows
    |=  n=@ud
    ^-  (list row)
    =/  c  1
    =/  rows=(list row)  ~[`row`~[id=0 name='0' map=[%m *(map @ @)]]]
    |-
    ?:  =(c n)
      rows
    %=  $
      c   +(c)
      rows  (weld rows ~[`row`~[id=c name=(crip "{<c>}") map=[%m *(map @ @)]]])
    ==
  ++  empty-database
    %+  ~(add-table db *database)
      %myapp^%boards
    ^-  table
    :^    (make-schema ~[[%id [0 %.n %ud]] [%name [1 %.n %t]] [%map [2 %.n %map]]])
        primary-key=~[%id]
      (make-indices ~[[~[%id] primary=& autoincrement=~ unique=& clustered=|]])
    ~
  --
--