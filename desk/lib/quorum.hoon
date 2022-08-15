/-  *quorum-nu

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
    :~  ['questions' a+(turn +>:upd grab-qs)]
        ['date' (numb now)]
    ==
  ==
  ++  grab-boards
  |=  =board
  ^-  json
  %-  pairs
  :~  ['name' s+name.board]
      ['description' s+desc.board]
      ['tags' a+(turn tags.board |=(a=@tas s+a))]
      ['image' (path image.board)] 
    ==
  ++  grab-qs
  |=  =question
  ^-  json
  %-  pairs
  :~  ['id' (numb id.question)]
      ['date' (sect date.question)]
      ['title' s+title.question]
      ['body' s+body.question]
      ['votes' n+(scot %si votes.question)]
      ['who' (ship who.question)]
      ['tags' a+(turn tags.question |=(a=@tas s+a))]
    == 
  --
--
