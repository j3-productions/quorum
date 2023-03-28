/-  forums
/+  verb, dbug
/+  *sss

%-  agent:dbug

::  listen for subscriptions on [%forums ....]
=/  sub-forums  (mk-subs forums ,[%forums *])

::  publish updates on [%forums %updates ~]
=/  pub-forums  (mk-pubs forums ,[%forums %updates ~])

|_  =bowl:gall
+*  this  .
    da-forums  =/  da  (da forums ,[%forums *])
                   (da sub-forums bowl -:!>(*result:da) -:!>(*from:da) -:!>(*fail:da))
::
    du-forums  =/  du  (du forums ,[%forums %updates ~])
                  (du pub-forums bowl -:!>(*result:du))
::
++  on-init  `this
::
++  on-save  !>([sub-forums pub-forums])
++  on-load
  |=  =vase
  =/  old  !<([=_sub-forums =_pub-forums] vase)
  :-  ~
  %=  this
    sub-forums  sub-forums.old
    pub-forums  pub-forums.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  ?+    mark  `this
  ::
    %forum-action
  =^  cards  pub-forums  (give:du-forums [%forums %updates ~] !<(wave.forums vase))
  [cards this]
  ::
    %surf-forums
  =^  cards  sub-forums
    (surf:da-forums !<(@p (slot 2 vase)) %forums !<([%forums *] (slot 3 vase)))
  [cards this]
  :: 
    %sss-on-rock
  `this
  ::
    %sss-to-pub
  ?-  msg=!<(into:du-forums (fled vase))
      [[%forums *] *]
    =^  cards  pub-forums  (apply:du-forums msg)
    [cards this]
  ==
  ::
    %sss-forums
  =^  cards  sub-forums  (apply:da-forums !<(into:da-forums (fled vase)))
  [cards this]
  ==
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