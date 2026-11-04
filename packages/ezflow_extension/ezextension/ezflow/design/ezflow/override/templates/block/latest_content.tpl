{* latest_content: the newest items of the block's source as dated cards, with a link to the source. In a narrow
   zone (the global zone beside articles) the cards drop their images (stylesheet, container query). *}
{def $valid_nodes = $block.valid_nodes
     $fx_source   = cond( is_set( $block.fetch_params.Source ), fetch( 'content', 'node', hash( 'node_id', $block.fetch_params.Source ) ), false() )}
<section class="fx-block fx-block--latest"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl' more=$fx_source}
    <div class="fx-grid fx-grid--3">
    {foreach $valid_nodes as $valid_node}
        {include uri='design:parts/ezflow/card.tpl' node=$valid_node meta=true() placeholder=false()}
    {/foreach}
    </div>
</section>
{undef $valid_nodes $fx_source}
