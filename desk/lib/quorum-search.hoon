/-  *quorum
|%
::  some search options
::
+$  search-field  ?(%title %text %both)
+$  search-type  ?(%exact %any)
+$  search-ranking  ?(%oldest %newest %votes)
++  search
  |=  [term=@t boards=(list board) =search-field =search-type =search-ranking]
  ^-  (list [=name =id])
  ?~  term
    !!
  ::  if exact, search the term
  ::
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
      ::  if any, break the term into words and search for each word
      ::
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
::  search a list of boards recursively by calling search-board
::
++  search-boards
  |=  [term=@t boards=(list board) =search-field]
  ^-  (list [p=name q=id r=date s=votes])
  =+  result=*(list [p=name q=id r=date s=votes])
  |-
    ?~  boards
      result
    $(result (weld (turn (search-board term i.boards search-field) |=([q=id r=date s=votes] [name.i.boards q r s])) result), boards t.boards)
::  search a single board
::
++  search-board
  |=  [term=@t =board =search-field]
  ^-  (list [q=id r=date s=votes])
  =+  threads=threadz.board
  ::  if %title, search only titles. If %text, search only text. If %both, call both and combine the results, remove duplicates.
  ::
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
::  check if a term is found in the answerz mop of a thread. calls match-answer and checks for a single yes.
::
++  match-answerz
  |=  [myterm=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ?:  (any:yes-no-orm (run:answerz-orm answerz.thread (cury match-answer myterm)) |=(a=[key=@ud val=?(%.y %.n)] val.a))
    [%.y id.question.thread date.question.thread votes.question.thread]
  [%.n 0 `@da`0 `@si`0]
::  check if a term is found in a single answer
::
++  match-answer
  |=  [term=@t =answer]
  ^-  ?(%.y %.n)
  (check-match term body.answer)
::  check if a text match is found in the title of a question of a thread.
::
++  match-title
  |=  [term=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ?:  (check-match term title.question.thread)
    [%.y id.question.thread date.question.thread votes.question.thread]
  [%.n 0 `@da`0 `@si`0]
::  function to see if a term is found in a text string
::
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
::  function to see if a term matches the beginning of a text string. used recursively by check-match.
::
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
::  breaks a tape of words separated by spaces into a list of words
::
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
::  shorthand for mop function usage
::
++  threadz-orm  ((on id thread) gth)
++  processing-orm  ((on id $:(p=?(%.y %.n) q=id r=date s=votes)) gth)
++  yes-no-orm  ((on id ?(%.y %.n)) gth)
++  answerz-orm  ((on id answer) gth)
--
