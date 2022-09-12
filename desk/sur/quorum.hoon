::
:: /sur/quorum - A Triple J Production
::
|% 
+$  id  @ud
+$  parent  id
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
    $%  question
        answer
    ==

+$  question
    $:  =id 
        =date
        =title
        =body
        =votes
        =who
        =tags
    ==

+$  answer
    $:  =id 
        =date
        =parent
        =body
        =votes
        =who
    ==

+$  answerz  ((mop id answer) gth)
::
+$  thread  
    $:  =question 
        =answerz
        =best
    ==
::
+$  threadz  ((mop id thread) gth)
::
+$  board                                             ::  knowledge base
    $:  =name
        =desc
        =threadz
        =clock
        =tags
        =image
    ==
::

+$  shelf  (map name board)                           
::

+$  server-action
    $%  [%add-board =name =desc =tags =image]
        [%remove-board =name]
        [%kick =name ship=@p]
    ==

+$  client-action
    $%  [%add-question =name =title =body =tags] 
        [%add-answer =name =parent =body]
        [%vote =thread-id =post-id =sing =name]
        [%set-best =thread-id =post-id =name]
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
    $%  [%questions (list question)]
        [%thread [=question answers=(list answer) =best]]
        [%boards (list board)]
    ==

+$  boop      :: updates to the client
    $%  [%nu-board =name =board]
        [%nu-thread =id =thread]
        [%nu-vote =id =thread]
        [%nu-best =id =thread]
    ==

+$  update                                     :: Updates to the front-end (fe-request) and subscribing ships (boop)
    %+  pair  @  
    $%  fe-request
        boop   
    ==
--
