/-  *quorum
|%
+$  search-field  ?(%title %text %both)
+$  search-type  ?(%exact %any)
+$  search-ranking  ?(%oldest %newest %votes)
++  search
  |=  [term=@t boards=(list board) =search-field =search-type =search-ranking]
  ^-  (list [=name =id])
  ?~  term
    !!
  ?-    search-type
      %exact
    ?-    search-ranking
        %oldest
      (turn (sort (search-boards term boards search-field) |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] (lth r.a r.b))) |=([p=name q=id r=date s=votes] [p q])) 
        %newest
      (turn (sort (search-boards term boards search-field) |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] (gth r.a r.b))) |=([p=name q=id r=date s=votes] [p q]))
        %votes
      (turn (sort (search-boards term boards search-field) |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] =+(bool=(cmp:si s.a s.b) ?:(=(bool --1) %.y %.n)))) |=([p=name q=id r=date s=votes] [p q]))
    ==
      %any
    =+  result=*(list [p=name q=id r=date s=votes])
    =+  words=(turn (process-row (trip term)) crip)
    |-
      ?~  words
        ?-    search-ranking
            %oldest
          (turn (sort result |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] (lth r.a r.b))) |=([p=name q=id r=date s=votes] [p q])) 
            %newest
          (turn (sort result |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] (gth r.a r.b))) |=([p=name q=id r=date s=votes] [p q]))
            %votes
          (turn (sort result |=([a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]] =+(bool=(cmp:si s.a s.b) ?:(=(bool --1) %.y %.n)))) |=([p=name q=id r=date s=votes] [p q]))
        ==
      $(words t.words, result (weld (search-boards i.words boards search-field) result))
  ==
++  search-boards
  |=  [term=@t boards=(list board) =search-field]
  ^-  (list [p=name q=id r=date s=votes])
  =+  result=*(list [p=name q=id r=date s=votes])
  |-
    ?~  boards
      result
    $(result (weld (turn (search-board term i.boards search-field) |=([q=id r=date s=votes] [name.i.boards q r s])) result), boards t.boards)
      
++  search-board
  |=  [term=@t =board =search-field]
  ^-  (list [q=id r=date s=votes])
  =+  threads=threadz.board
  ?-    search-field
      %title
    (turn (skim (tap:processing-orm (run:threadz-orm threads (cury match-title term))) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] p.b)) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] [q.b r.b s.b]))
      %text
    (turn (skim (tap:processing-orm (run:threadz-orm threads (cury match-answerz term))) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] p.b)) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] [q.b r.b s.b]))
      %both
    =+  titles-search-list=(turn (skim (tap:processing-orm (run:threadz-orm threads (cury match-title term))) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] p.b)) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] [q.b r.b s.b]))
    =+  text-search-list=(turn (skim (tap:processing-orm (run:threadz-orm threads (cury match-answerz term))) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] p.b)) |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] [q.b r.b s.b]))
    =+  combined-list=(weld titles-search-list text-search-list)
    ::  put in a set and turn it back to a list to de-duplicate
    ::
    ~(tap in (silt combined-list))
  ==

++  match-answerz
  |=  [myterm=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ::?:  (any:answerz-orm answerz.thread (cury match-answer2 myterm))
  ?:  (any:yes-no-orm (run:answerz-orm answerz.thread (cury match-answer myterm)) |=(a=[key=@ud val=?(%.y %.n)] val.a))
    [%.y id.question.thread date.question.thread votes.question.thread]
  [%.n 0 `@da`0 `@si`0]

++  match-answer2
  |=  [term=@t a=[key=@ud val=answer]]
  ^-  ?(%.y %.n)
  (check-match term body.val.a)

++  match-answer
  |=  [term=@t =answer]
  ^-  ?(%.y %.n)
  (check-match term body.answer)

++  match-title
  |=  [term=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ?:  (check-match term title.question.thread)
    [%.y id.question.thread date.question.thread votes.question.thread]
  [%.n 0 `@da`0 `@si`0]

++  check-match
  |=  [term=@t text=@t]
  ^-  ?(%.y %.n)
  ?~  term
    !!
  =+  term=(cass (trip term))
  =+  text=(cass (trip text))
  |-
    ?~  text
      %.n
    ?:  (check-match-beginning term text)
      %.y
    $(text t.text)

++  check-match-beginning
  |=  [term=tape text=tape]
  ^-  ?(%.y %.n)
  ?~  term
    !!
  |- 
    ?~  text
      %.n 
    ?:  =(i.term i.text)
      ?~  t.term
        %.y
      $(term t.term, text t.text)
    %.n

++  process-row
  |=  input=tape
  ^-  (list tape)
  :: face to store the words we parse and add to the list
  ::
  =/  word  *tape
  |-
    ::  if input is null, output the current word and end recursion
    ::
    ?~  input
      [i=(flop word) t=~]
    ::  if we are parsing a space
    ::
    ?:  =(i.input ' ')
      ::  check if we are at the end of the line
      ::
      ?~  t.input
        ::  if so output the current word and end recursion
        ::
        [i=(flop word) t=~]
      ::  otherwise add the current word to the list, reset the word to empty,
      ::  and keep parsing
      ::
      [i=(flop word) t=$(word *tape, input t.input)]
    ::  otherwise add the current character to the word and keep parsing
    ::
    $(word [i.input word], input t.input)

++  threadz-orm  ((on id thread) gth)
++  processing-orm  ((on id $:(p=?(%.y %.n) q=id r=date s=votes)) gth)
++  yes-no-orm  ((on id ?(%.y %.n)) gth)
++  answerz-orm  ((on id answer) gth)
--