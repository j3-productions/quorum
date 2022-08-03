/-  *quorum
|%
  ++  enjs-update
    =,  enjs:format
    |=  upd=update
    ^-  json
    |^
    ?-  -.upd
        %shelf-metadata
      (frond 'shelf-metadata' a+(turn +.upd nametag))
    == 
    ++  nametag
      |=  meta=board-metadata
      ^-  json
      %-  pairs
      :~  ['name' s+name.meta] 
          ['description' s+description.meta]
      ==
   --
--
