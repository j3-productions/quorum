/-  boards
/+  verb, dbug
/+  *sss

::  listen for subscriptions on [%qa ....]
=/  sub-boards  (mk-subs boards ,[%qa *])

::  publish updates on [%qa %updates ~]
=/  pub-boards  (mk-subs boards ,[%qa %updates ~])

|_  =bowl:gall
+*  this  .
    da-sub-boards  =/  da  (da boards ,[%qa *])
                   ~(. da-sub-boards -:!>(*result:da) -:!>(*from:da))
::
    du-pub-boards  =/  du  (du boards ,[%qa %updates ~])
                  ~(. du pub-boards bowl -:!>(*result:du))
::
++  on-init  `this
::
++  on-save  !>([sub-boards pub-boards])
++  on-load
  |=  =vase
  =/  old  !<([=_sub-boards =_pub-boards] vase)
  :-  ~
  %=  this
    sub-boards  sub-boards.old
    pub-boards  pub-boards.old
  ==
++  on-poke
  |=  [=mark =vase]
  ^-  (quip card:agent:gall _this)
  `this
++  on-agent
  |=  [=wire =sign:agent:gall]
  ^-  (quip card:agent:gall _this)
  `this

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



