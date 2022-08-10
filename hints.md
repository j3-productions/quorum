### Scries
```
::
::  scry endpoints
::
::    [%x %gimme ~]
::  .^((list @tas) %gx /=quorum-server=/gimme/noun)
::
::    [%x %what-board ~]
::  .^(json %gx /=quorum-server=/what-boards/json)
::
```
### Pokes
#### Populate board with post
```
:quorum-server &server-poke [%add-board %apples 'For Fuji and Macintosh lovers ONLY']
:quorum-server &client-poke [%add-post %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' ~]
:quorum-server &client-poke [%add-post %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' ~]
```
#### Test client-poke mark from dojo
```
=dir /=quorum=
=sample (need (de-json:html '{"add-post":{"target":"apples","title":"Amy Winehouse","body":"All time great female singer -- yay or nay?", "parent":null}}'))
=my &client-poke &json sample
```
