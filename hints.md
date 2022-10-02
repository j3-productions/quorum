### Pokes
```
::  adding boards 
:quorum &quorum-beans [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg']
:quorum &quorum-mail [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum &quorum-mail [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum &quorum-mail [%add-answer %apples `1 'I know... so annoying right?']
:quorum &quorum-mail [%vote %apples 1 3 %up]

::  setting best
:quorum &quorum-mail [%set-best 1 3 %apples]

::  sending doves (do this from a different board from the one hosting %apples)
=question [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-data &quorum-outs [%dove ~zod %apples question]

::  subscriptions (do this from a different board from the one hosting %apples)
:quorum &quorum-outs [%sub ~zod %apples]
:quorum &quorum-outs [%unsub ~zod %apples]
```

### Scries
```
::
::  scry endpoints

::
::
::    [%x boards ~]
::  .^(json %gx /=quorum=/boards/json)
::


::
::    [%x %questions @ @ ~]
::  .^(json %gx /=quorum=/questions/host/name/json)
::
> .^(json %gx /=quorum=/questions/(scot %p ~zod)/apples/json)


::
::    [%x %thread @ @ @ ~]
::  .^(json %gx /=quorum=/thread/host/name/id/json)
::
> .^(json %gx /=quorum=/thread/(scot %p ~zod)/apples/1/json)

```
