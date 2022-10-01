/-  *quorum

|%
  ++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  json
  |^
  =/  now=@  -.upd
  ?+  +<.upd  !!
      %boards
    %-  pairs
    :~  ['boards' a+(turn +>:upd grab-boards)]
    ==
    ::
      %questions
    %-  pairs
    :~  ['questions' a+(turn +>:upd grab-q)]
    ==
    ::
      %thread
    %-  pairs
    :~  ['question' (grab-q question.+>:upd)]
        ['answers' a+(turn answers.+>:upd grab-ans)]
        ['best' (numb-nits best.+>:upd)]
    ==
    ::
      %whose-boards
    %-  pairs
    :~  ['whose-boards' a+(turn +>:upd grab-host-boards)]
    ==
    ::
      %search
    %-  pairs
    :~  ['search' a+(turn +>:upd grab-search)]
    ==
  ==
  ++  grab-search
  |=  [=host =name =id]
  ^-  json
  %-  pairs
  :~  ['host' (ship host)]
      ['name' s+name]
      ['id' (numb id)]
  ==
  ++  grab-host-boards
  |=  [=host boards=(list board)]
  ^-  json
  %-  pairs
  :~  ['host' (ship host)]
      ['boards' a+(turn boards grab-boards)]
  == 
  ++  grab-boards
  |=  =board
  ^-  json
  %-  pairs
  :~  ['name' s+name.board]
      ['desc' s+desc.board]
      ['tags' a+(turn tags.board |=(a=@tas s+a))]
      ['image' s+image.board]
    ==
  ++  grab-q
  |=  =question
  ^-  json
  %-  pairs
  :~  ['id' (numb id.question)]
      ['date' (time date.question)]
      ['title' s+title.question]
      ['body' s+body.question]
      ['votes' s+(scot %si votes.question)]
      ['who' (ship who.question)]
      ['tags' a+(turn tags.question |=(a=@tas s+a))]
    ==
  ++  grab-ans
  |=  =answer
  ^-  json
  %-  pairs
  :~  ['id' (numb id.answer)]
      ['date' (time date.answer)]
      ['parent' (numb-nits parent.answer)]
      ['body' s+body.answer]
      ['votes' s+(scot %si votes.answer)]
      ['who' (ship who.answer)]
    ==
  ++  numb-nits
  |=  knit=(unit @ud)
  ^-  json
  ?+  knit  ~
    [~ u=@ud]  (numb u.knit)
  ==
--
  ++  dejs-server-poke
    =,  dejs:format
    |=  crumpler=json
    ^-  server-action
    %.  crumpler
    %-  of
    :~  [%add-board (ot ~[name+(se %tas) desc+so tags+(ar so) image+so])]
    ==
  ++  dejs-client-action
    =,  dejs:format
    |^
    |=  crumpler=json
    ^-  client-action
    %.  crumpler
    %-  of
    :~  [%add-question (ot ~[name+(se %tas) title+so body+so tags+(ar so)])]
        [%add-answer (ot ~[name+(se %tas) parent+ni body+so])]
        [%vote (ot ~[thread-id+ni post-id+ni sing+oud-se name+(se %tas)])]
        [%set-best (ot ~[thread-id+ni post-id+ni name+(se %tas)])]
    ==
   ++  oud-se
   |=  jon=json
   ^-  ?(%up %down)
   ?+  `@tas`((se %tas) jon)  !!
     %up  %up
     %down  %down
   ==
  --
  ++  dejs-client-pass
  =,  dejs:format
  |=  crumpler=json
  ^-  client-pass
  %.  crumpler
  %-  of
  :~  [%sub (ot ~[host+(se %p) name+(se %tas)])]
      [%unsub (ot ~[host+(se %p) name+(se %tas)])]
      [%dove (ot ~[host+(se %p) name+(se %tas) action+dejs-client-action])]
  ==
--
