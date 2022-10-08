/-  *quorum
|%
::  some search options
::
+$  s-field  ?(%title %text %both)
+$  s-type  ?(%exact %any)
+$  s-ranking  ?(%oldest %newest %votes)
+$  case  ?(%title %answers %question-body)
++  search
  |=  [term=@t boards=(list board) =s-field =s-type =s-ranking]
  ^-  (list [=name =id])
  ?~  term
    !!
  ::  if exact, search the term
  ::
  ?-    s-type
      %exact
    (sort-results (search-boards term boards s-field) s-ranking)
      ::  if any, break the term into words and search for each word
      ::
      %any
    =+  result=*(list [p=name q=id r=date s=votes])
    =+  words=(turn (process-row (trip term)) crip)
    |-
      ?~  words
        (sort-results result s-ranking)
      $(words t.words, result (weld (search-boards i.words boards s-field) result))
  ==
::  sorts and processes the returned list of search results for final output
::
++  sort-results
  |=  [result=(list [p=name q=id r=date s=votes]) =s-ranking]
  ^-  (list [p=name q=id])
  %+  turn
    %+  sort
      result
    |=  [a=[p=name q=id r=date s=votes] b=[p=name q=id r=date s=votes]]
    ?-  s-ranking
      %newest  (lth r.a r.b)
      %oldest  (gth r.a r.b)
      %votes  ?:(=((cmp:si s.a s.b) --1) %.y %.n)
    ==
  |=([p=name q=id r=date s=votes] [p q])
::  search a list of boards recursively by calling search-board
::
++  search-boards
  |=  [term=@t boards=(list board) =s-field]
  ^-  (list [p=name q=id r=date s=votes])
  =+  result=*(list [p=name q=id r=date s=votes])
  |-
    ?~  boards
      result
    %=  $
      boards  t.boards
      result  %+  weld
                %+  turn
                  (search-board term i.boards s-field)
                |=([q=id r=date s=votes] [name.i.boards q r s])
              result
    ==
::  search a single board
::
++  search-board
  |=  [term=@t =board =s-field]
  ^-  (list [q=id r=date s=votes])
  =+  threads=threads.board
  ::  if %title, search only titles. If %text, search only text. If %both, call both and combine the results, remove duplicates.
  ::
  ?-    s-field
      %title
    (get-hits threads term %title)
      %text
    =/  answers-search
      (get-hits threads term %answers)
    =/  question-body-search
      (get-hits threads term %question-body)
    ~(tap in (silt (weld answers-search question-body-search)))
      %both
    =/  titles-search
      (get-hits threads term %title)
    =/  answers-search
      (get-hits threads term %answers)
    =/  question-body-search
      (get-hits threads term %question-body)
    ::  put in a set and turn it back to a list to de-duplicate
    ::
    ~(tap in (silt (weld titles-search (weld question-body-search answers-search))))
  ==
::  does the searching and processes the returned data into the necessary format
::
++  get-hits
  |=  [=threads term=@t =case]
  ^-  (list [q=id r=date s=votes])
  %+  turn
    %+  skim
      %-  tap:processing-orm
      %+  run:threads-orm
        threads
      %+  cury
        ?-  case
          %title  match-title
          %answers  match-answers
          %question-body  match-question-body
        ==
      term
    |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] p.b)
  |=([a=id b=[p=?(%.y %.n) q=id r=date s=votes]] [q.b r.b s.b])

::  check if a term is found in the answers mop of a thread. calls match-answer and checks for a single yes.
::
++  match-answers
  |=  [myterm=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ::  check if there are any term matches within any of the answers of a thread
  ::
  ?:  %+  any:binarymop-orm
        %+(run:answers-orm answers.thread (cury match-answer myterm))
      |=(a=[key=@ud val=?(%.y %.n)] val.a)
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
::  check if a text match if found in the body of a question of a thread.
::
++  match-question-body
  |=  [term=@t =thread]
  ^-  [p=?(%.y %.n) q=id r=date s=votes]
  ?:  (check-match term body.question.thread)
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
      ::  check for repeated spaces, if so just recurse
      ::
      ?:  =(t.input ' ')
        $(input t.input)
      ::  otherwise append the word, reset the word to empty, recurse on the rest of input
      ::
      [i=(flop word) t=$(word *tape, input t.input)]
    ::  otherwise add the current character to the word and keep parsing
    ::
    $(word [i.input word], input t.input)
::  shorthand for mop function usage
::
++  threads-orm  ((on id thread) gth)
++  processing-orm  ((on id $:(p=?(%.y %.n) q=id r=date s=votes)) gth)
++  binarymop-orm  ((on id ?(%.y %.n)) gth)
++  answers-orm  ((on id answer) gth)
--
