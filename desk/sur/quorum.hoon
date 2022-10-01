::
:: /sur/quorum - A Triple J Production
::
:: special thanks to: ~lagrev-nocfep, ~noscyx-lassul, ~rabsef-bicrym, and ~haddef-sigwen.
::
::
|% 
+$  id  @ud
+$  parent  (unit id)
+$  thread-id  id
+$  post-id  id
+$  best  (unit id)
::

+$  text  @t
+$  desc  text
+$  body  text
+$  title  text
::

+$  name  @tas
+$  tags  (list @tas)
+$  votes  @si
+$  zooted  (set @p)
+$  toasted  (set @p)
+$  sing  ?(%up %down)
+$  image  @t
::

+$  date  @da
+$  clock  @ud
::

+$  who  @p
+$  host  @p
::

+$  poast
    $:  =id 
        =parent
        =date
        =title
        =body
        =votes
        =zooted
        =who
    ==

+$  question  poast
+$  answer  poast

::
+$  thread  
    $:  =question 
        =answers 
        =toasted
        =best
        =tags
    ==
::
+$  answers  ((mop id answer) gth) 

::
+$  threads  ((mop id thread) gth)
::
+$  board                                           
    $:  =name
        =desc
        =threads
        =clock
        =tags
        =image
    ==
::

+$  shelf  (map name board)                           
+$  library  (map host shelf)
::

+$  action     ::  ack-shun
    $%  server-action
        client-action
    ==

+$  server-action
    $%  [%add-board =name =desc =tags =image]
        [%remove-board =name]
        [%kick =name ship=@p]
        [%populate-board =name =board]
    ==

+$  client-action
    $%  [%add-question =host =name =title =body =tags] 
        [%add-answer =host =name =parent =body]
        [%vote =host =name =thread-id =post-id =sing]
        [%set-best =host =name =thread-id =post-id]
        [%sub =host =name]
        [%unsub =host =name]
    ==

+$  pass
    $%  [%dove =host =name =client-action]   :: send an action to the server through the client using a dove
    ==

+$  log  ((mop @ action) lth)
::

+$  fe-request
    $%  [%questions (list poast)]
        [%thread [question=poast answers=(list poast) =best]]
        [%boards (list board)]
        [%whose-boards (list [=host boards=(list board)])]
        [%search (list [=host =name =id])]
    ==

+$  boop      :: updates to the client
    $%  [%nu-board =host =name =board]
        [%nu-thread =host =id =thread]
        [%nu-vote =host =id =thread]
        [%nu-best =host =id =thread]
    ==

+$  update                                     :: Updates to the front-end (fe-request) and subscribing ships (boop)
    %+  pair  @  
    $%  fe-request
        boop   
    ==
--
