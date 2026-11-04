{* top_rated: the best rated content below the block's source (ezstarrating). *}
{def $top_rated_array = fetch_by_starrating( hash( 'parent_node_id', $block.custom_attributes.source_node_id,
                                                   'limit', first_set( $block.custom_attributes.limit, 5 ),
                                                   'sort_by', array( 'rating', false() ) ) )}
<section class="fx-block fx-block--compact fx-panel" aria-labelledby="fx-b-{$block.id}">
    <header class="fx-block__head"><h2 class="fx-block__title" id="fx-b-{$block.id}">{$block.name|wash}</h2></header>
    {if $top_rated_array|count}
    <ol class="fx-list">
    {foreach $top_rated_array as $top_rated}
        <li><a class="fx-list__link" href={$top_rated.url_alias|ezurl}><span class="fx-list__title">{$top_rated.name|wash}</span></a></li>
    {/foreach}
    </ol>
    {/if}
</section>
{undef $top_rated_array}
