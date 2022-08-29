::  Batch populates a list of 5 boards based on 5 books in the /data folder. Must be in a desk called %quorum to run.
/-  *quorum
/=  populate-board  /gen/populate-board
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] *]
:-  %noun
=+  board1=(populate-board [now eny bec] [%pride-and-prejudice 'The book Pride and Prejudice' [%jane %austen %book %literature ~] 10 10 `@si`--200 `@si`-10 /(scot %p p.bec)/quorum/(scot %da now)/data/pride-and-prejudice/txt ~] ~)
=+  board2=(populate-board [now eny bec] [%sherlock-holmes 'The book Adventures of Sherlock Holmes' [%doyle %sherlock %holmes %mystery %book %literature ~] 10 10 `@si`--200 `@si`-10 /(scot %p p.bec)/quorum/(scot %da now)/data/sherlock-holmes/txt ~] ~)
=+  board3=(populate-board [now eny bec] [%alice-in-wonderland 'The book Alice\'s Adventures in Wonderland' [%tag1 %tag2 %tag3 %tag4 %tag5 %tag6 %tag7 %tag8 %tag9 %tag10 %tag11 %tag12 %tag13 %tag14 %tag15 %tag16 %tag17 %tag18 %tag19 %tag %tag ~] 10 10 `@si`--200 `@si`-10 /(scot %p p.bec)/quorum/(scot %da now)/data/alice-in-wonderland/txt ~] ~)
=+  board4=(populate-board [now eny bec] [%frankenstein 'The book Frankenstein' [~] 10 10 `@si`--200 `@si`-10 /(scot %p p.bec)/quorum/(scot %da now)/data/frankenstein/txt ~] ~)
=+  board5=(populate-board [now eny bec] [%war-and-peace 'The book War and Peace' [%leo %tolstoy %russia ~] 10 10 `@si`--200 `@si`-10 /(scot %p p.bec)/quorum/(scot %da now)/data/war-and-peace/txt ~] ~)
[board1 board2 board3 board4 board5 ~]