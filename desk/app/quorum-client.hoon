::
::  app/quorum-client
::
/-  *quorum
/+  default-agent, dbug
|%
+$  versioned-state
  $%  state-0
  ==
+$  state-0  [%0 =library]
+$  card  card:agent:gall
++  otm  ((on id thread) gth)
++  oam  ((on id answer) gth)
--
%-  agent:dbug
=|  state-0
=*  state  -
^-  agent:gall
=<
|_  =bowl:gall
+*  this      .
    default   ~(. (default-agent this %.n) bowl)
    hc    ~(. +> bowl)
++  on-init
  ^-  (quip card _this)
  ~&  >  '%quorum-client initialized successfully'
  `this
++  on-save
  ^-  vase
  !>(state)
++  on-load
  |=  old-state=vase
  ^-  (quip card _this)
  =/  old  !<(versioned-state old-state)
  ?-  -.old
    %0  `this(state old)
  ==
::
++  on-poke                    :: poke to subscribe to board, send watch task (along with)
  |=  [=mark =vase]
  ^-  (quip card _this)
  ?+    mark  (on-poke:default mark vase)
      %client-pass
    =/  act  !<(client-pass vase)
    ?-    -.act
        %sub
      :_  this
      :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-server] %watch /updates/(scot %p host.act)/(scot %tas name.act)]
      ==
      ::
        %unsub
      =/  nu-shelf=shelf  (~(got by library) host.act)
      =.  nu-shelf  (~(del by nu-shelf) name.act)
      :_  this(library (~(put by library) host.act nu-shelf))
      :~  [%pass /nu/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-server] %leave ~]
      ==
        %dove
      :_  this
      :~  [%pass /line/(scot %p host.act)/(scot %tas name.act) %agent [host.act %quorum-server] %poke %client-action !>(client-action.act)]
      ==
    ==
  ==
::
++  on-watch  on-watch:default
++  on-leave  on-leave:default
++  on-peek
 |=  =path
 ^-  (unit (unit cage))
 ?+  path  (on-peek:default path)
      [%x %whose-boards ~]
   =/  shelves=(list [=host =shelf])  (limo ~(tap by library))
   =/  a=(list [=host boards=(list board)])
   %-  turn
   :-  shelves
       |=([=host =shelf] [host ~(val by shelf)])
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%client-boards a]]
   ::
      [%x %all-boards ~]
   =/  shelves=(list shelf)  ~(val by library)
   =/  boards=(list board)
   %-  zing  %-  turn
   :-  shelves  |=(a=shelf ~(val by a))
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%boards boards]]
   ::
      [%x %all-questions @ @tas ~]
   =/  =host  (slav %p i.t.t.path)
   =/  =name  i.t.t.t.path
   =/  =shelf  (~(got by library) host)
   =/  questions=(list question)
   %-  turn
     :-  (tap:otm threadz:(~(got by shelf) name))
     |=(a=[key=@ val=thread] question.val.a)
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%questions questions]]
   ::
      [%x %thread @ @tas @ ~]
   =/  =host  (slav %p i.t.t.path)
   =/  =name  i.t.t.t.path
   =/  =id  (rash i.t.t.t.t.path dem)
   =/  =shelf  (~(got by library) host)
   =/  =thread  (need (get:otm threadz:(~(got by shelf) name) id))
   =/  answers=(list answer)
   %-  turn
     :-  (tap:oam answerz:thread)
     |=(a=[key=@ val=answer] val.a)
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%thread question.thread answers best.thread]]
  ::
      [%x %boards-from-host @ ~]
   =/  host  (slav %p i.t.t.path)
   =/  =shelf  (~(got by library) host)
   :^  ~  ~  %server-update
   !>  ^-  update
   [now.bowl [%boards ~(val by shelf)]]
 ==
++  on-agent                                             :: respond to updates from server on the above wire
  |=  [=wire =sign:agent:gall]
  ^-  (quip card _this)
  ?+    wire  (on-agent:default wire sign)
      [%nu @ @ ~]
    =/  =name  -.+.+.wire
    =/  host=@p  (slav %p -.+.wire)
    ?+    -.sign  (on-agent:default wire sign)
        %watch-ack
      ?~  p.sign
        ((slog '%quorum-server: Subscribe succeeded' ~) `this)
      ((slog '%quorum-server: Subscribe failed' ~) `this)
    ::
        %kick
      :_  this
      :~  [%pass wire %agent [host %quorum-server] %watch /updates/(scot %p host)/(scot %tas name)]
      ==
    ::
        %fact
      ?+    p.cage.sign  (on-agent:default wire sign)
          %server-update
      =/  contents  !<(update q.cage.sign)
      =/  dump  q.contents
      ?+  dump  !!
        [%nu-board *]
      =/  nu-shelf=shelf
      ?.  (~(has by library) host.dump)  *shelf  (~(got by library) host.dump)
      =.  nu-shelf  (~(put by nu-shelf) name board.dump)
      `this(library (~(put by library) host.dump nu-shelf))
      ::
        [%nu-thread *]  ::grab the thread (if it exists) and replace it
      =/  nu-shelf=shelf  (~(got by library) host.dump)
      =/  mirror=board  (~(got by nu-shelf) name)
      =/  lock=threadz  threadz.mirror
      =.  lock  (put:otm lock id.dump thread.dump)
      =.  threadz.mirror  lock
      =.  clock.mirror  +(clock.mirror)
      =.  nu-shelf  (~(put by nu-shelf) name mirror)
      `this(library (~(put by library) host.dump nu-shelf))
      ::
        [%nu-vote *]
      =/  nu-shelf=shelf  (~(got by library) host.dump)
      =/  mirror=board  (~(got by nu-shelf) name)
      =/  lock=threadz  threadz.mirror
      =.  lock  (put:otm lock id.dump thread.dump)
      =.  threadz.mirror  lock
      =.  nu-shelf  (~(put by nu-shelf) name mirror)
      `this(library (~(put by library) host.dump nu-shelf))
      ::
        [%nu-best *]
      =/  nu-shelf=shelf  (~(got by library) host.dump)
      =/  mirror=board  (~(got by nu-shelf) name)
      =/  lock=threadz  threadz.mirror
      =.  lock  (put:otm lock id.dump thread.dump)
      =.  threadz.mirror  lock
      =.  nu-shelf  (~(put by nu-shelf) name mirror)
      `this(library (~(put by library) host.dump nu-shelf))
      ==
    ==
  ==
==
++  on-arvo   on-arvo:default
++  on-fail   on-fail:default
--
|_  =bowl:gall
++  unf
  |=  [=host =shelf]
  ^-  [@p (list board)]
  [host ~(val by shelf)]
--
