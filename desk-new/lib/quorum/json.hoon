/-  q=quorum
/+  etch
|%
++  enjs
  =,  enjs:format
  =>  |%
      ++  flagify
        |=  f=flag:q
        ^-  @t
        (rap 3 (scot %p p.f) '/' q.f ~)
      --
  |%
  ++  flag
    |=  f=flag:q
    ^-  json
    s+(flagify f)
  ::
  ++  tags
    |=  t=(set term)
    ^-  json
    a+(turn ~(tap in t) |=(=term s+term))
  ::
  ++  kids
    |=  c=(set @)
    ^-  json
    a+(turn ~(tap in c) numb)
  ::
  ++  votes
    |=  v=(map @p ?(%up %down))
    ^-  json
    %-  pairs
    %+  turn  ~(tap by v)
    |=  [p=@p v=?(%up %down)]
    [(scot %p p) s+`term`v]
  ++  edits
    |=  e=edits:q
    ^-  json
    :-  %a
    ::  list ordered most to least recent
    %+  turn  (tap:om-hist:q e)
    |=  [d=@da p=@p t=@t]
    %-  pairs
    :~  author+s+(scot %p p)
        content+s+t
        timestamp+(time d)
    ==
  ::
  ++  metadata
    |=  m=metadata:q
    ^-  json
    %-  pairs
    :~  board+(flag board.m)
        group+(flag group.m)
        title+s+title.m
        description+s+description.m
        allowed-tags+(tags allowed-tags.m)
        next-id+(numb next-id.m)
    ==
  ::
  ++  metadatas
    |=  m=(list metadata:q)
    ^-  json
    a+(turn m metadata)
  ::
  ++  post
    |=  p=post:q
    ^-  json
    %-  pairs
    :~  post-id+(numb post-id.p)
        parent-id+(numb parent-id.p)
        comments+(kids comments.p)
        votes+(votes votes.p)
        history+(edits history.p)
        board+(flag board.p)
        group+(flag group.p)
        :-  %thread
        ?~  thread.p
          ~
        =+  t=(need thread.p)
        %-  pairs
        :~  replies+(kids replies.t)
            best-id+(numb best-id.t)
            title+s+title.t
            tags+(tags tags.t)
        ==
    ==
  ::
  ++  posts
    |=  p=(list post:q)
    ^-  json
    a+(turn p post)
  ::
  ++  page
    |=  p=page:q
    ^-  json
    %-  pairs
    :~  posts+(posts posts.p)
        pages+(numb pages.p)
    ==
  ++  thread
    |=  t=thread:q
    ^-  json
    %-  pairs
    :~  thread+(post thread.t)
        posts+(posts posts.t)
    ==
  ::
  ++  action
    |=  [f=flag:q u=update:q]
    ^-  json
    =/  board=@t  (flagify f)
    %-  en-vase:etch
    ?+  -.u  !!
      %new-board     !>([new-board=[board=board group=(flagify group.u) +>.u]])
      %edit-board    !>([edit-board=[board=board +.u]])
      %delete-board  !>([delete-board=[board=board]])
      %new-thread    !>([new-thread=[board=board +.u]])
      %edit-thread   !>([edit-thread=[board=board +.u]])
      %new-reply     !>([new-reply=[board=board +.u]])
      %edit-post     !>([edit-post=[board=board +.u]])
      %delete-post   !>([delete-post=[board=board +.u]])
      %vote          !>([vote=[board=board +.u]])
    ==
  --
::
++  dejs
  =,  dejs:format
  =,  soft=dejs-soft:format
  |%
  ++  th    (ar (se %tas))
  ++  ts    (ar:soft |=(j=json ?.(?=([%s *] j) ~ (some (slav %tas p.j)))))
  ++  uso   (uf ~ so:soft)
  ++  flag  (su ;~((glue fas) ;~(pfix sig fed:ag) ^sym))
  ::
  ++  surf
    |=  jon=json
    ;;  surf-boards:q
    %.  jon
    %-  at
    :~  (su ;~(pfix sig fed:ag))
        (su (jest 'quorum'))
        (su (jest 'updates'))
        (su ;~(pfix sig fed:ag))
        so
        ul
    ==
  ++  action
    |=  jon=json
    ;;  action:q
    %.  jon
    %-  ot
    :~  board+flag
        :-  %update
        %-  of
        :~  new-board+(ot ~[group+flag title+so description+so tags+th])
            edit-board+(ou ~[title+uso description+uso tags+(uf ~ ts)])
            delete-board+ul
            new-thread+(ot ~[title+so tags+th content+so])
            edit-thread+(ou ~[post-id+(un ni) best-id+(uf ~ ni:soft) title+uso tags+(uf ~ ts)])
            new-reply+(ot ~[parent-id+ni content+so is-comment+bo])
            edit-post+(ot ~[post-id+ni content+so])
            delete-post+(ot ~[post-id+ni])
            vote+(ot ~[post-id+ni dir+|=(j=json ;;(?(%up %down) ((se %tas) j)))])
  ==    ==
  --
--
