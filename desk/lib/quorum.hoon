/-  *quorum-nu

|%
  ++  enjs-update
  =,  enjs:format
  |=  upd=update
  ^-  json
  |^
  =/  now=@  -.upd
  ?+  +<.upd  !!
      %boards
    ~&  +>:upd
    %-  pairs
    :~  ['time' (numb now)] 
        ['boards' a+(turn +>:upd grab-boards)]
    ==
  ==
  ++  grab-boards
  |=  =board
  ^-  json
  %-  pairs
  :~  ['name' s+name.board]
      ['description' s+desc.board]
      ['tags' a+(turn tags.board |=(a=@tas s+a))]
      ['image' (path image.board)] 
  ==
  --
--
