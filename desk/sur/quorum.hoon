::
:: /sur/channel
::
|% 
+$  id  @
+$  text  @t
+$  name  @tas
::
+$  post  [id=id text=text votes=@ud author=@p]
+$  question  post
+$  answer  [post=post best=?]
+$  thread  [=id =question replies=(list answer)]
::
+$  board                                             ::  knowledge base
    $:  =name
        description=@t
        content=((mop id thread) gth)
    ==
::
+$  buckets  ((mop id board) gth)                     ::  "board man gets buckets"
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
--
    

    
    
    
    
  
