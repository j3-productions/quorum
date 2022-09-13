### Pokes
#### Populate board with post
```
::  adding boards
:quorum-server &server-poke [%add-board %apples 'For Fuji and Macintosh lovers ONLY' ~ 'https://image-host.com/my-image.jpg']
:quorum-server &client-action [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-server &client-action [%add-question %apples 'Does anyone like Red Delicious?' 'All time underrated member of the malus family' [%red-delicious %likes ~]]
:quorum-server &client-action [%add-answer %apples 1 'I know... so annoying right?']

::  adding pre-populated boards
::  TODO: revise so that boards are appended to 'quorum-server' board state
+quorum!populate-boards
+quorum!populate-board %pride-and-prejudice 'Pride and Prejudice' ~[%jane %austen] 10 10 `@si`--200 `@si`-10 /=quorum=/data/pride-and-prejudice/txt

::  voting (won't catch multiple votes from a ship)
:quorum-server &client-action [%vote 1 1 %down %apples]

::  setting best
:quorum-server &client-action [%set-best 1 3 %apples]

::  sending doves
=question [%add-question %apples 'Apple Prices' 'What is up with these prices? A Fuji apple is 100 cents now!' [%prices ~]]
:quorum-client &client-pass [%dove ~zod %apples question]
```
#### Test client-action and client-pass marks from dojo. client-pass is a client-action wrapped with a `host` and the `name` of the board that the action is targeted towards.

Note, the code below does not work when "tags":null:
```

=marx -build-file /=quorum=/lib/quorum/hoon

=sample (need (de-json:html '{"add-answer":{"name":"apples", "parent": 1, "body":"All time great female singer -- yay or nay?"}}'))
(dejs-client-action:marx sample)
> [%add-answer name=%apples parent=1 body='All time great female singer -- yay or nay?']

=sample (need (de-json:html '{"dove":{"host":"~zod", "name":"apples", "action":{"set-best":{"thread-id":1, "post-id": 1, "name": "apples"}}}}'))
(dejs-client-pass:marx sample)
> [%dove host=~zod name=%apples client-action=[%set-best thread-id=1 post-id=1 name=%apples]]

=sample (need (de-json:html '{"sub":{"host":"~zod", "name":"apples"}}'))
(dejs-client-pass:marx sample)
```

#### Subscriptions
```
:quorum-client &client-pass [%sub our %apples]
:quorum-client &client-pass [%unsub our %apples]
```

### Scries for both server and client
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
[ %o
    p
  { [p='best' q=[%n p=~.3]]
    [ p='answers'
        q
      [ %a
          p
        ~[
          [ %o
              p
            { [p='id' q=[%n p=~.3]]
              [p='date' q=[%n p=~.1661998162]]
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
          [p='date' q=[%n p=~.1661998153]]
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
