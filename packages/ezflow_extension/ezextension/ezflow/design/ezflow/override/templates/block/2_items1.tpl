{* 2_items1: the block's items as a grid of cards (container query: 1 to 2 columns by zone width). *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--items fx-block--2"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    <div class="fx-grid fx-grid--2">
    {foreach $valid_nodes as $valid_node}
        {include uri='design:parts/ezflow/card.tpl' node=$valid_node variant='card'}
    {/foreach}
    </div>
</section>
{undef $valid_nodes}
