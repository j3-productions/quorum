::  Given a text file as input, it will populate a board with lines of data based 
::  the contents of the file. Uses data structures defined in /sur/quorum.hoon.
::
::    Usage:  +populate-board boardname boarddesc boardtags max-post-length max-num-replies max-votes min-votes file boardimage(optional)
::    The input should be a text file that is broken up by lines.
::
/-  *quorum
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] [boardname=name boarddesc=desc boardtags=tags max-post-length=@ud max-num-replies=@ud max-votes=@si min-votes=@si file=path ~] [boardimage=path]]
:-  %board
=<
^-  board
=/  count=clock  0
::  retrieve and format the text file as a wain, remove empty lines
::
=+  text=.^(wain %cx file)
=+  text=(strip-empty-lines text)
::  initialize empty threads structure
::
=+  boardthreadz=*threadz
::  initialize randomness source/function
::
=/  rng  ~(. og eny)
=/  rngtype  -:!>(rng)
|-
  ::  output when text exhausted
  ::
  ?~  text
    [boardname boarddesc boardthreadz count boardtags boardimage]
  ::  otherwise generate a thread, add it and recurse
  ::
  =+  thread-result=(populate-thread text max-post-length max-num-replies count max-votes min-votes rng)
  %=  $
    boardthreadz  (put:threadz-orm boardthreadz id.question.r.thread-result r.thread-result)
    count  p.thread-result
    text  q.thread-result
    rng  rng.thread-result
  ==
|%
::  arm to populate a thread, returns updated clock, remaining text, the thread, and randomness
::
++  populate-thread
  |=  [text=wain max-post-length=@ud max-num-replies=@ud count=clock max-votes=@si min-votes=@si rng=_og]
  ^-  [p=clock q=wain r=thread rng=_og]
  ?~  text
    [count ~ *thread rng]
  ::  populate a question
  ::
  =+  question-output=(populate-question count text max-post-length max-votes min-votes rng)
  =+  rng=rng.question-output
  ::  if there is no more text remaining after population
  ::
  ?~  q.question-output
    [p.question-output ~ [r.question-output *replies ~] rng]
  ::  otherwise populate replies
  ::
  =+  replies-output=(populate-replies p.question-output (sub p.question-output 1) q.question-output max-post-length max-num-replies max-votes min-votes rng)
  [p.replies-output q.replies-output [r.question-output r.replies-output best.replies-output] rng.replies-output]
::
::  arm to populate a mop of replies, returns updated clock, remaining text, replies, a possible best reply, and randomness
::
++  populate-replies
  |=  [count=clock question=parent text=wain max-post-length=@ud max-num-replies=@ud max-votes=@si min-votes=@si rng=_og]
  ^-  [p=clock q=wain r=replies best=(unit id) rng=_og]
  ::  get random number of replies
  ::
  =^  num-replies  rng  (rads:rng max-num-replies)
  ::  initalize empty result
  ::
  =+  result=*replies
  ::  counter just for our trap to make the right number of replies
  ::
  =/  counter=@ud  0
  |-
    ::  done if text is empty or we reach the required number of replies
    ::
    ?~  |(=(text ~) =(num-replies counter))
      ::  get a random best answer
      ::
      =^  best  rng  (rads:rng (add counter 1))

      =+  best=?:(=(best counter) ~ (some (add best (sub count counter))))
      :: return result
      ::
      [count text result best rng]
    :: if not done, generate a new answer, add it, and recurse
    ::
    =+  answer-result=(populate-answer count question text max-post-length max-votes min-votes rng)
    %=  $
      result  (put:replies-orm result id.r.answer-result r.answer-result)
      counter  (add counter 1)
      count  (add count 1)
      text  q.answer-result
      rng  rng.answer-result
    ==
::
::  arm to populate a question, returns updated clock, remaining text, the question, and randomness
::
++  populate-question
  |=  [count=clock text=wain max-post-length=@ud max-votes=@si min-votes=@si rng=_og]
  ^-  [p=clock q=wain r=question rng=_og]
  ?~  text
    [(add count 1) ~ *question rng]
  ::  get random planet
  ::
  =^  planet  rng  (rads:rng 4.294.967.296)
  ::  get random vote count
  ::
  =+  votes-output=(random-votes max-votes min-votes rng)
  =+  votes=votes.votes-output
  =+  rng=rng.votes-output
  ::  get one line of text for title
  ::
  =+  split1=(split-wain text 1)
  =+  title=(snag 0 p.split1)
  =+  text=q.split1
  ?~  text
    [(add count 1) ~ [count now title *@t votes planet *(list @tas)] rng]
  ::  get 1 line of text for tags
  ::
  =+  split1=(split-wain text 1)
  =+  tags=(text-line-to-tags (snag 0 p.split1))
  =+  text=q.split1
  ?~  text
    [(add count 1) ~ [count now title *@t votes planet tags] rng]
  ::  get random question length
  ::
  =^  question-length  rng  (rads:rng (sub max-post-length 1))
  =+  question-length=(add question-length 1)
  ::  get text by splitting lines up to question-length
  ::
  =+  split=(split-wain text question-length)
  =+  question-text=(merge-wain p.split)
  =+  text=q.split
  [(add count 1) text [count now title question-text votes planet tags] rng]
::
::  arm to populate an answer, returns updated clock, remaining text, the thread, and randomness
::
++  populate-answer
  |=  [count=clock qid=parent text=wain max-post-length=@ud max-votes=@si min-votes=@si rng=_og]
  ^-  [p=clock q=wain r=answer rng=_og]
  ?~  text
    [(add count 1) ~ *answer rng]
  ::  get random planet, answer length in lines, number of votes
  ::
  =^  planet  rng  (rads:rng 4.294.967.296)
  =^  answer-length  rng  (rads:rng max-post-length)
  =+  votes-result=(random-votes max-votes min-votes rng)
  =+  votes=votes.votes-result
  =+  rng=rng.votes-result
  ::  get answer text
  ::
  =+  splitted-wain=(split-wain text answer-length)
  [(add count 1) q.splitted-wain [count now qid (merge-wain p.splitted-wain) votes planet] rng]
::  helper arm to split a wain by index
::
++  split-wain
  |=  [text=wain num=@ud]
  ^-  [p=wain q=wain]
  ?:  (gte num (lent text))
    [text *wain]
  [(scag num text) (slag num text)]
::  helper arm to fuse a wain into a single @t
::
++  merge-wain
  |=  text=wain
  ^-  @t
  (crip (roll (turn (turn text trip) append-space) |:([a="" b=""] (weld a b))))
::  appends a space to a tape, helper for merge-wain
::
++  append-space
  |=  text=tape
  ^-  tape
  (weld text " ")
::  helper arm to remove empty lines from the incoming text file
::
++  strip-empty-lines
  |=  text=wain
  ^-  wain
  (skip text |=(a=cord =(a ~)))
::  turns a line of text into a list @tas
::
++  text-line-to-tags
  |=  text=cord
  ^-  (list @tas)
  (murn (turn (process-row (trip text)) crip) (sand %tas))
::  helper arm for text-line-to-tags, turns a tape into a list of words.
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
::  generates a random vote in rage, returns the vote and randomness
::
++  random-votes
  |=  [max-votes=@si min-votes=@si rng=_og]
  ^-  [votes=@si rng=_og]
  =^  votes  rng  (rads:rng `@ud`(abs:si (dif:si max-votes min-votes)))
  =+  votes=(dif:si (new:si & votes) min-votes)
  [votes rng]
:: arms used for function calls on the threadz mop and replies mop, basically just for brevity
::
++  threadz-orm  ((on id thread) gth)
++  replies-orm  ((on id answer) gth)
--
