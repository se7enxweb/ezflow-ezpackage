{* 5_items2: two large cards, then three smaller ones (a magazine grid). *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--items fx-block--5"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    <div class="fx-grid fx-grid--5">
    {foreach $valid_nodes as $i => $valid_node}
        {include uri='design:parts/ezflow/card.tpl' node=$valid_node alias=cond( $i|lt( 2 ), 'fx_wide', 'fx_card' ) text=$i|lt( 2 )}
    {/foreach}
    </div>
</section>
{undef $valid_nodes}
