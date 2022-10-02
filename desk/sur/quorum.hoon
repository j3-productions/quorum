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
+$  ship  @p
+$  target  @p
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


+$  beans            :: internal bookkeeping for bean counters
    $%  [%add-board =name =desc =tags =image]
        [%remove-board =name]
        [%kick =name ship=@p]
        [%populate-board =name =board]
    ==

+$  outs
    $%    :: subscriptions to remote boards, actions to remote boards
        [%sub =host =name]
        [%unsub =host =name]
        [%dove =host =name =mail]
    ==

+$  mail             :: the pieces of mail (pokes) from users which you then forward as (facts) to subscribers. you can receive a piece of mail as a fact from boards you are subscribed to.
    $%  [%add-question =name =title =body =tags] 
        [%add-answer =name =parent =body]
        [%vote =name =thread-id =post-id =sing]
        [%set-best =name =thread-id =post-id]
    ==

:: +$  log  ((mop @ action) lth)
::

+$  fe-request
    $%  [%questions (list [=question =tags])]
        [%thread [=question answers=(list answer) =best]]
        [%boards (list board)]
        [%whose-boards (list [=host boards=(list board)])]
        [%search (list [=host =name =id])]
    ==

+$  boop
    $%  mail
        [%nu-board =name =board]
    ==

+$  update                                     :: Updates to the front-end (fe-request) and subscribing ships (boop)
    %+  pair  @  
    $%  fe-request
        boop
    ==
--
