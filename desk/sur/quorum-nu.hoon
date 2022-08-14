::
:: /sur/quorum - A Triple J Production
::
|% 
+$  id  @ud
+$  parent  id
::

+$  text  @t
+$  desc  text
+$  body  text
+$  title  text
::

+$  name  @tas
+$  tags  (list @tas)
+$  votes  @si
+$  image  path
::

+$  time  @da
+$  clock  @ud
::

+$  who  @p
+$  host  @p
::

+$  question
    $:  =id 
        =time
        =title
        =body
        =votes
        =who
        =tags
    ==

+$  answer
    $:  =id 
        =time
        =parent
        =body
        =votes
        =who
    ==

+$  replies  ((mop id answer) gth)
::
+$  thread  
    $:  =question 
        =replies
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
    $%  [%add-question =name =title =body] 
        [%add-answer =name =parent =body]
        [%upvote =id =name =who]
        [%downvote =id =name =who]
        [%join-board =name =host]
        [%set-best =id =who]
    ==

+$  log  ((mop @ action) lth)

+$  action
    $%  server-action
        client-action
    ==
::

+$  fe-request
    $%  [%boards (list board)]
        [%questions (list question)]
    ==

+$  update                                     :: Updates to the front end
    %+  pair  @  fe-request
--
