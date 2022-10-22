::
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
+$  upvoted  (set @p)
+$  downvoted  (set @p)
+$  toasted  (set @p)
+$  sing  ?(%up %down)
+$  image  @t
+$  voters  (set @p)
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

+$  members  (set @p)
+$  mods  (set @p)
+$  banned  (set @p)
+$  allowed  (set @p)

+$  caste  
  $?  %comet   :: comets and above (pawn+)
      %moon    :: moons and above (earl+)
      %planet  :: planets and above (duke+)
      %star    :: stars and above (king+)
      %galaxy  :: galaxys only (czar+)
  ==

+$  axis  [join=?(%invite caste) vote=caste post=caste]

+$  board
    $:  =name
        =desc
        =threads
        =clock
        =tags
        =image
        =axis
        =mods
        =members
        =banned
        =allowed
    ==


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
        =upvoted
        =downvoted
        =who
    ==

+$  answers  ((mop id answer) gth)
+$  threads  ((mop id thread) gth)

+$  thread
    $:  =question
        =answers
        =toasted                                           :: if you're toasted, you've poasted
        =best
        =tags
    ==

+$  shelf  (map name board)
+$  library  (map host shelf)


+$  beans                                                   :: bookkeeping for board owners (bean counters) local pokes only.
    $%  [%add-board =name =desc =tags =image =axis]
        [%remove-board =name]
        [%populate-board =name =board]                      :: for testing usage
    ==

+$  gavel
$%  [%unban =name =ship]
    [%ban =name =ship]
    [%allow =name =ship]
    [%toggle =name =axis]                                         :: apply a new set of permissions
    [%add-mod =name =ship]
    [%remove-mod =name =ship]
    [%remove-post =name =thread-id =post-id]
    [%remove-thread =name =thread-id]
==

+$  outs                                                    :: subscriptions to remote boards, actions to remote boards. note: self-dove is possible.
    $%
        [%sub =host =name]
        [%unsub =host =name]
        [%dove =to =name =mail]
        [%judge =to =name =gavel]
    ==

+$  mail                                                     :: the pieces of mail (pokes) from users which you then forward as (facts) to subscribers.
    $%  [%add-question =name =title =body =tags]             :: you can receive a piece of mail as a fact from boards you are subscribed to.
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
        [%permissions =host =name =members =banned =allowed =axis]
    ==

+$  boop
    $%  [%forward =from =mail]
        [%serve =gavel]
        [%nu-board =name =board]
    ==

+$  update                                                    :: updates to the front-end (fe-request) and subscribing ships (boop)
    %+  pair  @
    $%  fe-request
        boop
    ==
--
