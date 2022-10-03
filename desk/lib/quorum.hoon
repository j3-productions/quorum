/-  *quorum

|%
  ++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  json
  |^
  =/  now=@  -.upd
  ?+  -.+.upd  !!
      %questions
    %-  pairs
    :~  ['questions' a+(turn +.+.upd grab-plack)]
    ==
    ::
      %thread
    %-  pairs
    :~  ['question' (grab-q question.+.+.upd)]
        ['answers' a+(turn answers.+.+.upd grab-ans)]
        ['best' (numb-nits best.+.+.upd)]
        ['tags' a+(turn tags.+.+.upd |=(a=@tas s+a))]
    ==
    ::
      %boards
    %-  pairs
    :~  ['all-boards' a+(turn +>:upd grab-host-boards)]
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
    ==
  ++  grab-plack
  |=  a=[=question =tags]
  ^-  json
  %-  pairs
  :~  ['question' (grab-q question.a)]
      ['tags' a+(turn tags.a |=(a=@tas s+a))]
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
  ++  dejs-mail
  =,  dejs:format
  |^
  |=  crumpler=json
  ^-  mail
  %.  crumpler
  %-  of
  :~  [%add-question (ot ~[name+(se %tas) title+so body+so tags+(ar so)])]
      [%add-answer (ot ~[name+(se %tas) parent+ni:dejs-soft:format body+so])]
      [%vote (ot ~[name+(se %tas) thread-id+ni post-id+ni sing+oud-se])]
      [%set-best (ot ~[name+(se %tas) thread-id+ni post-id+ni])]
  ==
   ++  oud-se
   |=  jon=json
   ^-  ?(%up %down)
   ?+  `@tas`((se %tas) jon)  !!
     %up  %up
     %down  %down
   ==
  --
  ++  dejs-outs
  =,  dejs:format
  |=  crumpler=json
  ^-  outs
  %.  crumpler
  %-  of
  :~  [%sub (ot ~[host+(se %p) name+(se %tas)])]
      [%unsub (ot ~[host+(se %p) name+(se %tas)])]
      [%dove (ot ~[host+(se %p) name+(se %tas) mail+dejs-mail])]
  ==
  ++  dejs-beans
  =,  dejs:format
  |=  crumpler=json
  ^-  beans
  %.  crumpler
  %-  of
  :~  [%add-board (ot ~[name+(se %tas) desc+so tags+(ar so) image+so])]
  ==
--
