<?php /* #?ini charset="utf-8"?

# The Testimonials view of the 2 to 5 items blocks (block.ini ViewList[]=testimonials), in every siteaccess
[block_testimonials]
Source=block/view/view.tpl
MatchFile=block/testimonials.tpl
Subdir=templates
Match[view]=testimonials

# The second view of the 5 items block, which had no rule
[block_5_items2]
Source=block/view/view.tpl
MatchFile=block/5_items2.tpl
Subdir=templates
Match[type]=Manual5Items
Match[view]=5_items2

*/ ?>
