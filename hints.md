### Pokes
#### Populate board with post
```
:quorum-server &server-poke [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ *path]
:quorum-server &client-poke [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~] ~]
:quorum-server &client-poke [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
```
#### Test client-poke mark from dojo
Note, the code below does not work when "tags":null:
```
=dir /=quorum=
=sample (need (de-json:html '{"add-question":{"name":"apples","title":"Amy Winehouse","body":"All time great female singer -- yay or nay?", "tags":["amy-winehouse","singers"]}}'))
=my &client-poke &json sample
```

### Scries
```
::
::  scry endpoints
::
::
::    [%x %what-board ~]
::  .^(json %gx /=quorum-server=/what-boards/json)
.^(json %gx /=quorum-server=/what-boards/json)

::
::    [%x %all-questions @tas ~]
::  .^(json %gx /=quorum-server=/all-questions/name/json)
.^(json %gx /=quorum-server=/all-questions/apples/json)
```
