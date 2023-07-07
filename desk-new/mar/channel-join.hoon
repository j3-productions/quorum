/-  q=quorum
/+  j=quorum-json
::  group flag + channel flag
|_  join=[group=flag:q chan=flag:q]
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
  ++  noun  [group=flag:q chan=flag:q]
  ++  json
    %-  ot:dejs:format
    :~  group/flag:dejs:j
        chan/flag:dejs:j
    ==
  --
--
