::
:: /sur/channel
::
|% 
+$  id  @ud
+$  text  @t
+$  name  @tas
::
+$  post                    :: JOIE: questions have titles, answers do not
    $:  id=id
        parent=(unit id)
        date=@ 
        =text 
        votes=@ud           :: JOIE: might need to be signed
        author=@p 
    ==
+$  board-metadata  [=name description=text]

::
+$  thread  
    $:  =id
        content=(list post) 
        best=(unit id)
    ==
::
+$  children  ((mop id thread) gth)
::
+$  board                                             ::  knowledge base
    $:  =name
        description=text
        =children
        clock=@ud
    ==
::
+$  shelf  ((mop name board) gth)                     
::
+$  server-action
    $%  [%add-board =name description=text]
        [%remove-board =name]
    ==
::
+$  client-action
    $%  [%add-post =post =name parent=(unit id) ship=@p] 
        [%upvote =id =name who=@p]
        [%downvote =id =name who=@p]
        [%set-best =id who=@p]
        [%join-board =name ship=@p]
    ==

+$  update
    $%  [%shelf-metadata (list board-metadata)]
    ==
--

    
    
    
    
  
