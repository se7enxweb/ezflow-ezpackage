{* gallery1: the block's images as a mosaic; each opens larger in the lightbox (javascript/ezflow-site.js), and is a
   plain link to the image's page without JavaScript. *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--gallery"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl' more=cond( $valid_nodes|count, $valid_nodes[0].parent, false() )}
    <ul class="fx-gallery fx-gallery--block" data-fx-lightbox role="list">
    {foreach $valid_nodes as $valid_node}
        {include uri='design:parts/ezflow/tile.tpl' node=$valid_node}
    {/foreach}
    </ul>
</section>
{undef $valid_nodes}
