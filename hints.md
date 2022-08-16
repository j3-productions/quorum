### Pokes
#### Populate board with post
```
:quorum-server &server-poke [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg']
:quorum-server &client-poke [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-server &client-poke [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum-server &client-poke [%add-answer %apples 1 'I know... so annoying right?']
```
#### Test client-poke mark from dojo
Note, the code below does not work when "tags":null:
```
=dir /=quorum=

=sample (need (de-json:html '{"add-question":{"name":"apples","title":"Amy Winehouse","body":"All time great female singer -- yay or nay?", "tags":["amy-winehouse","singers"]}}'))
=my &client-poke &json sample

=sample (need (de-json:html '{"add-answer":{"name":"apples", "parent": 1, "body":"All time great female singer -- yay or nay?"}}'))
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
::
> .^(json %gx /=quorum-server=/what-boards/json)
[ %o
    p
  { [p='date' q=[%n p=~.170141184505786116815164008820503478272]]
    [ p='boards'
        q
      [ %a
          p
        ~[
          [ %o
              p
            { [p='description' q=[%s p='For Fuji and Macintosh lovers ONLY']]
              [p='image' q=[%s p='https://image-host.com/my-image.jpg']]
              [p='name' q=[%s p='apples']]
              [p='tags' q=[%a p=~]]
            }
          ]
        ]
      ]
    ]
  }
]


::
::    [%x %all-questions @tas ~]
::  .^(json %gx /=quorum-server=/all-questions/name/json)
::
> .^(json %gx /=quorum-server=/all-questions/apples/json)
[ %o
    p
  { [ p='questions'
        q
      [ %a
          p
        ~[
          [ %o
              p
            { [p='id' q=[%n p=~.2]]
              [p='date' q=[%n p=~.1660667964]]
              [p='who' q=[%n p=~."tadryl-pindes-matrus-labref--harfer-tamful-lasrem-wanzod"]]
              [p='title' q=[%s p='Does anyone like Red Delicious?']]
              [p='votes' q=[%s p='--0i0']]
              [p='body' q=[%s p='All time underrated member of the malus family']]
              [p='tags' q=[%a p=~[[%s p='red-delicious'] [%s p='likes']]]]
            }
          ]
          [ %o
              p
            { [p='id' q=[%n p=~.1]]
              [p='date' q=[%n p=~.1660667955]]
              [p='who' q=[%n p=~."tadryl-pindes-matrus-labref--harfer-tamful-lasrem-wanzod"]]
              [p='title' q=[%s p='Apple Prices']]
              [p='votes' q=[%s p='--0i0']]
              [p='body' q=[%s p='What is up with these prices? A Fuji apple is 100 cents now!']]
              [p='tags' q=[%a p=~[[%s p='prices']]]]
            }
          ]
        ]
      ]
    ]
    [p='date' q=[%n p=~.170141184505786115421223644430646378496]]
  }
]
::
::    [%x %thread @tas @ ~]
::  .^(json %gx /=quorum-server=/thread/name/id/json)
::
> .^(json %gx /=quorum-server=/thread/apples/1/json)

    p
  { [ p='answers'
        q
      [ %a
          p
        ~[
          [ %o
              p
            { [p='id' q=[%n p=~.4]]
              [p='date' q=[%n p=~.1660668517]]
              [p='parent' q=[%n p=~.1]]
              [p='who' q=[%n p=~."tadryl-pindes-matrus-labref--harfer-tamful-lasrem-wanzod"]]
              [p='votes' q=[%s p='--0i0']]
              [p='body' q=[%s p='They arepretty cheap where I am from in MN']]
            }
          ]
          [ %o
              p
            { [p='id' q=[%n p=~.3]]
              [p='date' q=[%n p=~.1660667969]]
              [p='parent' q=[%n p=~.1]]
              [p='who' q=[%n p=~."tadryl-pindes-matrus-labref--harfer-tamful-lasrem-wanzod"]]
              [p='votes' q=[%s p='--0i0']]
              [p='body' q=[%s p='I know... so annoying right?']]
            }
          ]
        ]
      ]
    ]
    [ p='question'
        q
      [ %o
          p
        { [p='id' q=[%n p=~.1]]
          [p='date' q=[%n p=~.1660667955]]
          [p='who' q=[%n p=~."tadryl-pindes-matrus-labref--harfer-tamful-lasrem-wanzod"]]
          [p='title' q=[%s p='Apple Prices']]
          [p='votes' q=[%s p='--0i0']]
          [p='body' q=[%s p='What is up with these prices? A Fuji apple is 100 cents now!']]
          [p='tags' q=[%a p=~[[%s p='prices']]]]
        }
      ]
    ]
  }
]


```
