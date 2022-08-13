::
:: /sur/quorum
::
|% 
+$  id  @ud
+$  text  @t
+$  name  @tas
+$  parent  (unit id)
+$  tags  (list @tas)
::
+$  post                    :: JOIE: questions have titles, answers do not
    $:  parent=(unit id)
        time=@ 
        body=text 
        votes=@ud           :: JOIE: might need to be signed
        author=@p
        =tags 
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
        =tags
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
    $%  [%add-post target=name title=text body=text =parent]   :: JOIE remove the extra parent?
        [%upvote =id =name who=@p]
        [%downvote =id =name who=@p]
        [%join-board =name host=@p]
        [%set-best =id who=@p]
    ==

+$  update                                     :: Updates to the front end
    $%  [%shelf-metadata (list board-metadata)]
        [%questions (list [title=text =post])]
    ==
--

    
    
    
    
  
