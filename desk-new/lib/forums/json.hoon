/-  f=forums
/+  etch
|%
++  enjs
  =,  enjs:format
  =>  |%
      ++  flagify
        |=  f=flag:f
        ^-  @t
        (rap 3 (scot %p p.f) '/' q.f ~)
      --
  |%
  ++  flag
    |=  f=flag:f
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
    |=  e=edits:f
    ^-  json
    :-  %a
    ::  list ordered most to least recent
    %+  turn  (tap:om-hist:f e)
    |=  [d=@da p=@p t=@t]
    %-  pairs
    :~  author+s+(scot %p p)
        content+s+t
        timestamp+(time d)
    ==
  ::
  ++  metadata
    |=  m=metadata:f
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
    |=  m=(list metadata:f)
    ^-  json
    a+(turn m metadata)
  ::
  ++  post
    |=  p=post:f
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
    |=  p=(list post:f)
    ^-  json
    a+(turn p post)
  ::
  ++  page
    |=  p=page:f
    ^-  json
    %-  pairs
    :~  posts+(posts posts.p)
        pages+(numb pages.p)
    ==
  ++  thread
    |=  t=thread:f
    ^-  json
    %-  pairs
    :~  thread+(post thread.t)
        posts+(posts posts.t)
    ==
  ::
  ++  poke
    |=  [b=flag:f a=forums-action:f]
    ^-  json
    =/  board=@t  (flagify b)
    %-  en-vase:etch
    ?+    -.a  !!
        %new-board
      =/  group=@t  (flagify group.a)
      !>([new-board=[board=board group=group +>.a]])
    ::
        %edit-board
      !>([edit-board=[board=board +.a]])
    ::
        %delete-board
      !>([delete-board=[board=board]])
    ::
        %new-thread
      !>([new-thread=[board=board +.a]])
    ::
        %edit-thread
      !>([edit-thread=[board=board +.a]])
    ::
        %new-reply
      !>([new-reply=[board=board +.a]])
    ::
        %edit-post
      !>([edit-post=[board=board +.a]])
    ::
        %delete-post
      !>([delete-post=[board=board +.a]])
    ::
        %vote
      !>([vote=[board=board +.a]])
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
    ;;  surf-boards:f
    %.  jon
    %-  at
    :~  (su ;~(pfix sig fed:ag))
        (su (jest 'forums'))
        (su (jest 'updates'))
        (su ;~(pfix sig fed:ag))
        so
        ul
    ==
  ++  poke
    |=  jon=json
    ;;  forums-poke:f
    %.  jon
    %-  ot
    :~  board+flag
        :-  %action
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
