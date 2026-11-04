{* 4_items1: the block's items as horizontal cards (image beside the text). *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--rows"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    <div class="fx-grid fx-grid--2">
    {foreach $valid_nodes as $valid_node}
        {include uri='design:parts/ezflow/card.tpl' node=$valid_node variant='row' alias='fx_thumb'}
    {/foreach}
    </div>
</section>
{undef $valid_nodes}
