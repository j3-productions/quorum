/-  *quorum

|%
  ++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  json
  |^
  =/  now=@  -.upd
  ?-  +<.upd  
      %boards
    %-  pairs
    :~  ['boards' a+(turn +>:upd grab-boards)]
        ['date' (numb now)]
    ==
    ::
      %questions
    %-  pairs
    :~  ['questions' a+(turn +>:upd grab-q)]
        ['date' (numb now)]
    ==
    ::
      %thread
    %-  pairs
    :~  ['question' (grab-q question.+>:upd)]
        ['answers' a+(turn answers.+>:upd grab-ans)]
    ==
  ==
  ++  grab-boards
  |=  =board
  ^-  json
  %-  pairs
  :~  ['name' s+name.board]
      ['description' s+desc.board]
      ['tags' a+(turn tags.board |=(a=@tas s+a))]
      ['image' s+image.board] 
    ==
  ++  grab-q
  |=  =question
  ^-  json
  %-  pairs
  :~  ['id' (numb id.question)]
      ['date' (sect date.question)]
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
      ['date' (sect date.answer)]
      ['parent' (numb parent.answer)]
      ['body' s+body.answer]
      ['votes' s+(scot %si votes.answer)]
      ['who' (ship who.answer)]
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
  ++  dejs-client-poke
    =,  dejs:format
    |=  crumpler=json
    ^-  client-action
    %.  crumpler
    %-  of
    :~  [%add-question (ot ~[name+(se %tas) title+so body+so tags+(ar so)])]
        [%add-answer (ot ~[name+(se %tas) parent+ni body+so])]
    ==
--
