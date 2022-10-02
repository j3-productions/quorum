### Pokes
```
::  adding boards 
:quorum-data &quorum-beans [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg']
:quorum-data &quorum-mail [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-data &quorum-mail [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum-data &quorum-mail [%add-answer %apples `1 'I know... so annoying right?']
:quorum-data &quorum-mail [%vote %apples 1 1 %up]

::  setting best
:quorum-data &quorum-mail [%set-best 1 3 %apples]

::  sending doves (do this from a different board from the one hosting %apples)
=question [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-data &quorum-outs [%dove ~zod %apples question]

::  subscriptions (do this from a different board from the one hosting %apples)
:quorum-data &quorum-outs [%sub ~zod %apples]
:quorum-data &quorum-outs [%unsub ~zod %apples]
```

### Scries
```
::
::  scry endpoints

::
::
::    [%x boards ~]
::  .^(json %gx /=quorum-data=/boards/json)
::


::
::    [%x %questions @ @ ~]
::  .^(json %gx /=quorum-data=/questions/host/name/json)
::
> .^(json %gx /=quorum-data=/questions/(scot %p ~zod)/apples/json)


::
::    [%x %thread @ @ @ ~]
::  .^(json %gx /=quorum-server=/thread/host/name/id/json)
::
> .^(json %gx /=quorum-server=/thread/(scot %p ~zod)/apples/1/json)

```
