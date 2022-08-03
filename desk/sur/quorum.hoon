::
:: /sur/channel
::
|% 
+$  id  @
+$  text  @t
+$  name  @tas
::
+$  post  
    $:  id=id
        date=@ 
        =text 
        votes=@ud :: might need to be signed
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
    ==
::
+$  shelf  ((mop name board) gth)                     
::
+$  server-action
    $%  [%add-board =name description=@t]
        [%remove-board =name]
    ==
::
+$  client-action
    $%  [%add-post =post =name ship=@p] 
        [%up-vote =id =name who=@p]
        [%down-vote =id =name who=@p]
        [%set-best =id who=@p]
    ==

+$  update
    $%  [%shelf-metadata (list board-metadata)]
    ==
--
    

    
    
    
    
  
