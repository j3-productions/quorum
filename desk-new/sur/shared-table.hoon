/+  n=nectar
|%
++  name  %shared-table
+$  rock  table:n
+$  wave  query:n
++  wash
  |=  [=rock =wave]
  ?+    -.wave  rock  ::  no-op
      %add-table  ::  happens at creation, once
    (~(create tab:n actual.wave) ~)
      %update
    +:(~(update tab:n rock) primary-key.rock where.wave cols.wave)
      %insert
    =-  (~(insert tab:n rock) - update=%.n)
    `(list row:n)`(turn rows.wave |=(i=* !<(row:n [-:!>(*row:n) i])))
      %delete
    ::  TODO intelligent selection here?
    =/  query-key  primary-key.rock
    (~(delete tab:n rock) query-key where.wave)
      %update-rows
    =-  (~(insert tab:n rock) - update=%.y)
    `(list row:n)`(turn rows.wave |=(i=* !<(row:n [-:!>(*row:n) i])))
      %add-column
    (~(add-column tab:n rock) +.+.wave)
      %drop-column
    (~(drop-column tab:n rock) col-name.wave)
      %edit-column
    (~(edit-column tab:n rock) +.+.wave)
  ==
--