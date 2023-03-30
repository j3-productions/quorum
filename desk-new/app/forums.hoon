/-  *forums, *nectar, query-update
/+  verb, dbug
/+  *sss, nectar

%-  agent:dbug
%+  verb  &

=|  num-posts=(map term @ud)

::  listen for subscriptions on [%updates %app-name %table-label ....]
=/  sub-nectar  (mk-subs query-update ,[%updates %forums @ ~])

|_  =bowl:gall
+*  this  .
    threads-table  |=(=term (cat 3 term '-threads'))
    posts-table  |=(=term (cat 3 term '-posts'))
    da-nectar  =/  da  (da forums ,[%updates @ @ ~])
                   (da sub-nectar bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
++  on-init  `this
::  poke %nectar agent to initialize database
::
++  on-save 
  !>(=_sub-nectar)
++  on-load
  |=  =vase
  =/  old  !<([=_sub-nectar] vase)
  :-  ~
  %=  this
    sub-nectar  sub-nectar.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
      %forum-action
    =/  act  !<(forum-action vase) 
    ?+    -.act  `this
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
  `this
::
++  on-arvo
  |=  [=wire sign=sign-arvo]
  ^-  (quip card:agent:gall _this)
  `this
::
++  on-peek   _~
++  on-watch  _`this
++  on-leave  _`this
++  on-fail   _`this
--