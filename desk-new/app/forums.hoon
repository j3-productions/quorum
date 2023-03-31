/-  *forums, *nectar, table-updates
/+  verb, dbug
/+  *sss, nectar

%-  agent:dbug
%+  verb  &

=/  sub-updates  (mk-subs table-updates ,[%updates *])
=/  num-posts  *(map term @ud)

|_  =bowl:gall
+*  this  .
    threads-table  |=(=term (cat 3 term '-threads'))
    posts-table  |=(=term (cat 3 term '-posts'))
    da-updates  =/  da  (da table-updates ,[%updates *])
                   (da sub-updates bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  on-init  `this
::  poke %nectar agent to initialize database
::
++  on-save 
  !>([=_num-posts =_sub-updates])
++  on-load
  |=  =vase
  =/  old  !<([=_num-posts =_sub-updates] vase)
  :-  ~
  %=  this
    sub-updates  sub-updates.old
    num-posts    num-posts.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
      %surf-updates
    =^  cards  sub-updates
      (surf:da-updates !<(@p (slot 2 vase)) %nectar !<([%updates @ @ ~] (slot 3 vase)))
    [cards this]
    ::
      %sss-table-updates
    =^  cards  sub-updates  (apply:da-updates !<(into:da-updates (fled vase)))
    =/  update  |3:!<(into:da-updates (fled vase))
    ?.  ?=([%scry %wave *] update)
      [cards this]
    ~&  >  "TODO: handle state diff {<wave.update>}"
    [cards this]
    ::
      %forum-action
    =/  act  !<(forum-action vase) 
    ?+    -.act  `this
      ::  note: the code below hasn't been checked
        %join-board
      :_  this
      ::  ask our nectar agent to track a remote board
      :~  :*  %pass  /forums/join
              %agent  [our.bowl %nectar]
              %poke  %nectar-track
              !>(`track`[%forums %start host.act %forums (threads-table name.act)])
          == 
          :*  %pass  /forums/join
              %agent  [our.bowl %nectar]
              %poke  %nectar-track
              !>(`track`[%forums %start host.act %forums (posts-table name.act)])
      ==  == 
      ::
        %new-board 
      =.  num-posts  (~(put by num-posts) name.act 0)
      =/  threads=table
      :^    (make-schema threads-schema)
          primary-key=~[%thread-id]
        (make-indices ~[[~[%thread-id] primary=& autoincrement=~ unique=& clustered=|]])
      ~
      =/  posts=table
      :^    (make-schema posts-schema)
          primary-key=~[%post-id]
        (make-indices ~[[~[%post-id] primary=& autoincrement=~ unique=& clustered=|]])
      ~
      :_  this
      :~  ^-  card:agent:gall
          :*  %pass  /nectar/updates
              %agent  [our.bowl %nectar]
              %poke  %nectar-query
              !>(`query-poke`[%forums [%add-table (threads-table name.act) threads]])
          == 
          :*  %pass  /nectar/updates
              %agent  [our.bowl %nectar]
              %poke  %nectar-query
              !>(`query-poke`[%forums [%add-table (posts-table name.act) posts]])
          == 
      ==  

      ::
        %new-thread
      =/  id=@ud  (~(got by num-posts) board.act) 
      =.  num-posts  (~(put by num-posts) board.act +(id))
      =/  =post
        :*  id  id  ~
            now.bowl  src.bowl
            content.act  ~  *(map @p term) 
        ==
      :_  this
      :~  :*  %pass  /nectar/updates
              %agent  [our.bowl %nectar]
              %poke  %nectar-query
              !>  ^-  query-poke
              :^    %forums 
                  %insert 
                (threads-table board.act)
              ~[`thread`[id now.bowl src.bowl title.act tags.act]]
          ==  
          :*  %pass  /nectar/updates
              %agent  [our.bowl %nectar]
              %poke  %nectar-query
              !>  ^-  query-poke
              :^    %forums 
                  %insert 
                (posts-table board.act)
              ~[post]
          ==
      ==
      ::
        %new-post
      =/  id=@ud  (~(got by num-posts) board.act)
      =.  num-posts  (~(put by num-posts) board.act +(id))
      =/  =post
        :*  id  thread-id.act  parent-id.act
            now.bowl  src.bowl  content.act  
            ~  *(map @p term)
        ==
      :_  this
      :~  ^-  card:agent:gall
          :*  %pass  /nectar/updates
              %agent  [our.bowl %nectar]
              %poke  %nectar-query
              !>  ^-  query-poke
              :^    %forums 
                  %insert 
                (posts-table board.act)
              ~[post]
      ==  ==
    ==
  ==
::
::
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card:agent:gall _this)
  ?>  ?=(%poke-ack -.sign)
  ?~  p.sign  `this
  %-  (slog u.p.sign)
  ?+    wire  `this
      [~ %sss %on-rock @ @ @ %updates *]
    `this
    ::
  ==
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
  ?+    wire  `this
    [~ %sss %behn @ @ @ %updates @ @ ~]  [(behn:da-updates |3:wire) this]
  ==
::
++  on-peek   _~
++  on-watch  _`this
++  on-leave  _`this
++  on-fail   _`this
--
