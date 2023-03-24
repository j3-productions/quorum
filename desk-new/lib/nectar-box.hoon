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
++  run-query
  |=  [=database =query]
  %+  turn
  =<  -
    %+(~(q db database) %myapp query)
  |=(=row !<(generic-row [-:!>(*generic-row) row]))
++  run-mutation
  |=  [=database =query]
  (~(q db database) %myapp query)
++  drake-bangers
  :~  'Successful'
      'houstonlantavegas'
      'Over'
      'Marvins Room'
      'Best I Ever Had'
      'Headlines'
      'Jaded'
      'Best I Ever Had'
      'Hotline Bling'
      'Controlla'
      'Passionfruit'
      'Hold On We\'re Going Home'
      'All Me'
      'Summer Games'
      'Ratchet Happy Birthday'
      'After Dark'
      'Cameras'
      'Shot For Me'
      'Work'
      'When To Say When'
      'Legend'
      'Over My Dead Body'
      'Jungle'
  ==
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
    =/  rows=(list row)  ~[`row`~[id=0 name='0']]
    |-
    ?:  =(c n)
      rows
    %=  $
      c   +(c)
      rows  (weld rows ~[`row`~[id=c name=(crip "{<c>}")]])
    ==
  ++  empty-database
    %+  ~(add-table db *database)
      %myapp^%boards
    ^-  table
    :^    (make-schema ~[[%id [0 %.n %ud]] [%name [1 %.n %t]]])
        primary-key=~[%id]
      (make-indices ~[[~[%id] primary=& autoincrement=~ unique=& clustered=|]])
    ~
  --
--