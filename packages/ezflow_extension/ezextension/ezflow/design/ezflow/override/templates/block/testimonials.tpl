{* testimonials (a view of the 2 to 5 items blocks): each item's intro as a quote, its author (or name) below it. *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--quotes"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    <div class="fx-quotes">
    {foreach $valid_nodes as $valid_node}
        <figure class="fx-quote" data-fx-reveal>
            <svg class="fx-quote__mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><path d="M4 18c0-6 4-11 10-12v4c-3 1-5 3-5 6h5v10H4zm14 0c0-6 4-11 10-12v4c-3 1-5 3-5 6h5v10H18z"/></svg>
            <blockquote>{include uri='design:parts/ezflow/teaser_text.tpl' node=$valid_node}</blockquote>
            <figcaption class="fx-quote__who">{if and( is_set( $valid_node.data_map.author ), $valid_node.data_map.author.has_content )}{$valid_node.data_map.author.content.author_list[0].name|wash}{else}{$valid_node.name|wash}{/if}</figcaption>
        </figure>
    {/foreach}
    </div>
</section>
{undef $valid_nodes}
