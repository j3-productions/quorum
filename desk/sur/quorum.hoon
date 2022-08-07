::
:: /sur/channel
::
|% 
+$  id  @ud
+$  text  @t
+$  name  @tas
+$  parent  (unit id)
::
+$  post                    :: JOIE: questions have titles, answers do not
    $:  parent=(unit id)
        date=@ 
        body=text 
        votes=@ud           :: JOIE: might need to be signed
        author=@p 
    ==
+$  board-metadata  [=name description=text]

::
+$  thread  
    $:  =content
        title=text
        best=(unit id)
    ==
::
+$  content  ((mop id post) gth)
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
    $%  [%add-post target=name title=text body=text date=@ author=@p =parent]   :: JOIE remove the extra parent?
        [%upvote =id =name who=@p]
        [%downvote =id =name who=@p]
        [%join-board =name host=@p]
        [%set-best =id who=@p]
    ==

+$  update
    $%  [%shelf-metadata (list board-metadata)]
    ==
--

    
    
    
    
  
