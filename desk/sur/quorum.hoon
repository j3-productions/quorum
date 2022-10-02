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
+$  members  (set @p)
+$  sing  ?(%up %down)
+$  image  @t
::

+$  date  @da
+$  clock  @ud
::

+$  who  @p
+$  host  @p
+$  ship  @p
+$  to  @p
+$  from  @p

::

+$  question  poast
+$  answer  poast
+$  comment  poast

+$  poast
    $:  =id 
        =parent
        =date
        =title
        =body
        =votes
        =zooted          :: if you're zooted, you've voted
        =who
    ==

+$  answers  ((mop id answer) gth) 
+$  threads  ((mop id thread) gth)

+$  thread  
    $:  =question 
        =answers 
        =toasted         :: if you're toasted, you've poasted
        =best
        =tags
    ==
 
+$  board                                           
    $:  =name
        =desc
        =threads
        =clock
        =tags
        =image
        =members
    ==

+$  shelf  (map name board)                           
+$  library  (map host shelf)


+$  beans            :: bookkeeping for board owners (bean counters) local pokes only.
    $%  [%add-board =name =desc =tags =image]
        [%remove-board =name]
        [%add-mod =name =ship]
        [%kick =name =ship]
        [%remove-mod =name =ship]
        [%populate-board =name =board]  :: for testing usage
        [%toggle ~]                     :: toggle between public/private
    ==

+$  gavel            ::  moderator actions
    $%  [%ban =name =ship]
        [%allow =name =ship]
        [%remove-post =name =thread-id =post-id]
    ==

+$  outs
    $%    :: subscriptions to remote boards, actions to remote boards
        [%sub =host =name]
        [%unsub =host =name]
        [%dove =to =name =mail]
        [%judge =to =name =gavel]
    ==

+$  mail             :: the pieces of mail (pokes) from users which you then forward as (facts) to subscribers. you can receive a piece of mail as a fact from boards you are subscribed to.
    $%  [%add-question =name =title =body =tags] 
        [%add-answer =name =parent =body]
        [%vote =name =thread-id =post-id =sing]
        [%set-best =name =thread-id =post-id]
    ==

::+$  log  ((mop @ action) lth)

+$  fe-request
    $%  [%questions (list [=question =tags])]
        [%thread [=question answers=(list answer) =best =tags]]
        [%boards (list [=host boards=(list board)])]
        [%search (list [=host =name =id])]
    ==

+$  boop
    $%  [%forward =from =mail]
        [%nu-board =name =board]
    ==

+$  update                                     :: Updates to the front-end (fe-request) and subscribing ships (boop)
    %+  pair  @  
    $%  fe-request
        boop
    ==
--
