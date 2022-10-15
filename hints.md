### Pokes
```
::  adding boards 
:quorum-agent &quorum-beans [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg' axis=[join=%invite vote=%comet post=%comet]]
:quorum-agent &quorum-mail [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-agent &quorum-mail [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum-agent &quorum-mail [%add-answer %apples `1 'I know... so annoying right?']
:quorum-agent &quorum-mail [%vote %apples 1 3 %up]

::  setting best
:quorum-agent &quorum-mail [%set-best 1 3 %apples]

::  moderator actions (assuming that ~wex is hosting and ~zod is getting
allowed or banned)
:quorum-agent &quorum-gavel [%gavel ~wex %apples [%allow ~zod]]
:quorum-agent &quorum-gavel [%gavel ~wex %apples [%ban ~zod]]

::  sending doves (do this from a different board ~wex since it is the one hosting %apples)
=question [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-agent &quorum-outs [%dove ~wex %apples question]

::  subscriptions (do this from a different board from the one hosting %apples)
:quorum-agent &quorum-outs [%sub ~wex %apples]
:quorum-agent &quorum-outs [%unsub ~wex %apples]
```

### Scries
```
::
::  scry endpoints

::
::    [%x boards ~]
::  .^([type] %gx /=quorum-agent=/boards/[mark])
::
> .^(json %gx /=quorum-agent=/boards/json)


::
::    [%x %questions @ @ ~]
::  .^([type] %gx /=quorum-agent=/questions/host/name/[mark])
::
> .^(json %gx /=quorum=agent=/questions/(scot %p ~zod)/apples/json)


::
::    [%x %thread @ @ @ ~]
::  .^([type] %gx /=quorum-agent=/thread/host/name/id/[mark])
::
> .^(json %gx /=quorum-agent=/thread/(scot %p ~zod)/apples/1/json)

::
::    [%x %permissions] @ @ ~]
::  .^([type] %gx /=quorum-agent=/permissions/host/name/[mark])
::
> .^(json %gx /=quorum-agent=/permissions/(scot %p our)/apples/json)

```
