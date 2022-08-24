::
:: /sur/quorum - A Triple J Production
::
|% 
+$  id  @ud
+$  parent  id
+$  thread-id  id
+$  post-id  id
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
        best=(unit id)
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
    ==

+$  client-action
    $%  [%add-question =name =title =body =tags] 
        [%add-answer =name =parent =body]
        [%vote =thread-id =post-id =sing =name =who]
        [%set-best =thread-id =post-id =name =who]
        [%join-board =name =host]                ::  handled by subscription
    ==

+$  log  ((mop @ action) lth)

+$  action
    $%  server-action
        client-action
    ==
::

+$  fe-request
    $%  [%questions (list question)]
        [%thread [=question answers=(list answer)]]
        [%board =name =board]
        [%boards (list board)]
    ==

+$  update                                     :: Updates to the front end
    %+  pair  @  fe-request
--
