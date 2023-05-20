/-  *forums
|%
::  ++  enjs-update
++  dejs-action
  =,  dejs:format
  =,  soft=dejs-soft:format
  |=  jon=json
  ;;  forums-action
  =-  [[-.- +<.-] +>.-]
  =+  ht=(ar (se %tas))                                                  ::  hard tags
  =+  st=(ar:soft |=(j=json ?.(?=([%s *] j) ~ (some (slav %tas p.j)))))  ::  soft tags
  %.  jon
  %-  ot
  :~  host+(se %p)
      board+(se %tas)
      :-  %action
      %-  of
      :~  new-board+(ot ~[display-name+so channel+pa description+so tags+ht])
          :-  %edit-board
          %-  ou
          :~  display-name+(uf ~ so:soft)
              channel+(uf ~ (su:soft stap))
              description+(uf ~ so:soft)
              tags+(uf ~ (ar:soft st))
          ==
          delete-board+ul
          new-thread+(ot ~[title+so tags+ht content+so])
          edit-thread+(ou ~[post-id+(un ni) title+(uf ~ so:soft) tags+(uf ~ st)])
          new-reply+(ot ~[parent-id+ni content+so is-comment+bo])
          edit-post+(ot ~[post-id+ni content+so])
          delete-post+(ot ~[post-id+ni])
          vote+(ot ~[post-id+ni dir+|=(j=json ;;(?(%up %down) ((se %tas) j)))])
      ==
  ==
--
