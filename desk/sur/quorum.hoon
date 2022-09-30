::
:: /sur/quorum - A Triple J Production
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
        =who
    ==
::
+$  thread  
    $:  =poasts 
        =best
        =tags
    ==
::
+$  poasts  ((mop id poast) lth) 

::
+$  threads  ((mop id thread) gth)
::
+$  board                                             ::  knowledge base
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

+$  shun     ::  ack-shun
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
    ==

+$  client-pass
    $%  [%dove =host =name =client-action]   :: send an action to the server through the client using a dove
        [%sub =host =name]
        [%unsub =host =name]
    ==

+$  log  ((mop @ action) lth)

+$  action
    $%  server-action
        client-action
    ==
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
