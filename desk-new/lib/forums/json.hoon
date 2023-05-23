/-  *forums
|%
::  ++  enjs
::  ::
++  dejs
  =,  dejs:format
  =,  soft=dejs-soft:format
  |%
  ++  th  (ar (se %tas))
  ++  ts  (ar:soft |=(j=json ?.(?=([%s *] j) ~ (some (slav %tas p.j)))))
  ++  uso  (uf ~ so:soft)
  ++  flag  (su ;~((glue fas) ;~(pfix sig fed:ag) ^sym))
  ::
  ++  action
    |=  jon=json
    ;;  forums-action
    %.  jon
    %-  ot
    :~  board+flag
        :-  %action
        %-  of
        :~  new-board+(ot ~[group+flag title+so description+so tags+th])
            edit-board+(ou ~[title+uso description+uso tags+(uf ~ ts)])
            delete-board+ul
            new-thread+(ot ~[title+so tags+th content+so])
            edit-thread+(ou ~[post-id+(un ni) best-id+(uf ~ ni:soft) title+uso tags+(uf ~ ts)])
            new-reply+(ot ~[parent-id+ni content+so is-comment+bo])
            edit-post+(ot ~[post-id+ni content+so])
            delete-post+(ot ~[post-id+ni])
            vote+(ot ~[post-id+ni dir+|=(j=json ;;(?(%up %down) ((se %tas) j)))])
  ==    ==
  --
--
