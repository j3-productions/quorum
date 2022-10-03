### Pokes
```
::  adding boards 
:quorum-agent &quorum-beans [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg']
:quorum-agent &quorum-mail [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-agent &quorum-mail [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum-agent &quorum-mail [%add-answer %apples `1 'I know... so annoying right?']
:quorum-agent &quorum-mail [%vote %apples 1 3 %up]

::  setting best
:quorum-agent &quorum-mail [%set-best 1 3 %apples]

::  sending doves (do this from a different board from the one hosting %apples)
=question [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-agent &quorum-outs [%dove ~zod %apples question]

::  subscriptions (do this from a different board from the one hosting %apples)
:quorum-agent &quorum-outs [%sub ~zod %apples]
:quorum-agent &quorum-outs [%unsub ~zod %apples]
```

### Scries
```
::
::  scry endpoints

::
::
::    [%x boards ~]
::  .^(json %gx /=quorum-agent=/boards/json)
::


::
::    [%x %questions @ @ ~]
::  .^(json %gx /=quorum-agent=/questions/host/name/json)
::
> .^(json %gx /=quorum=agent=/questions/(scot %p ~zod)/apples/json)


::
::    [%x %thread @ @ @ ~]
::  .^(json %gx /=quorum-agent=/thread/host/name/id/json)
::
> .^(json %gx /=quorum-agent=/thread/(scot %p ~zod)/apples/1/json)

```
