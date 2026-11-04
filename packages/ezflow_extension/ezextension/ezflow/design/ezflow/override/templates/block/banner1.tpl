{* banner1: a call to action. The block's item (a banner, or any content) gives the title, the text, the image and
   the link; the block's name is the heading when there is no item. The ad server tag of earlier versions is gone:
   its server no longer exists. *}
{def $valid_node = $block.valid_nodes[0]}
<section class="fx-block fx-block--cta">
<div class="fx-cta" data-fx-reveal>
    <div>
        <h2 class="fx-cta__title">{cond( $block.name|trim, $block.name, $valid_node.name )|wash}</h2>
        {if $valid_node}
        <div class="fx-cta__text">{include uri='design:parts/ezflow/teaser_text.tpl' node=$valid_node}</div>
        <div class="fx-cta__actions">
            {if and( is_set( $valid_node.data_map.url ), $valid_node.data_map.url.has_content, eq( $valid_node.data_map.url.data_type_string, 'ezstring' ) )}
            <a class="fx-btn" href="{$valid_node.data_map.url.content|wash}">{$valid_node.name|wash}</a>
            {else}
            <a class="fx-btn" href={$valid_node.url_alias|ezurl}>{$valid_node.name|wash}</a>
            {/if}
            <a class="fx-btn fx-btn--light" href="https://doc.exponential.earth">{'Documentation'|i18n( 'design/ezflow/pagelayout' )}</a>
        </div>
        {/if}
    </div>
    {if and( $valid_node, 1|eq( 1 ) )}
    <div class="fx-cta__media">{include uri='design:parts/ezflow/teaser_image.tpl' node=$valid_node alias='fx_card'}</div>
    {/if}
</div>
</section>
{undef $valid_node}
