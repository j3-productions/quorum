/-  q=quorum
/+  j=quorum-json
::  group flag + channel flag
|_  join=join:q
++  grad  %noun
++  grow
  |%
  ++  noun  join
  ++  json
    %-  pairs:enjs:format
    :~  group/(flag:enjs:j group.join)
        chan/(flag:enjs:j chan.join)
    ==
  --
++  grab
  |%
  ++  noun  join:q
  ++  json
    %-  ot:dejs:format
    :~  group/flag:dejs:j
        chan/flag:dejs:j
    ==
  --
--
