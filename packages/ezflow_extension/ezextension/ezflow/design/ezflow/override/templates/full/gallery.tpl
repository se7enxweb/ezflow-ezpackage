{* Gallery: its description, then every image as a tile of a mosaic; a tile opens the lightbox. *}
{def $page_limit = 30
     $children = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'offset', $view_parameters.offset, 'limit', $page_limit,
                                                 'class_filter_type', 'include', 'class_filter_array', array( 'image' ), 'sort_by', $node.sort_array ) )
     $children_count = fetch( 'content', 'list_count', hash( 'parent_node_id', $node.node_id, 'class_filter_type', 'include', 'class_filter_array', array( 'image' ) ) )}
<div class="fx-container">
    <header class="fx-pagehead">
        <p class="fx-kicker">{$node.class_name|wash}</p>
        <h1>{$node.name|wash}</h1>
        {if $node.data_map.short_description.has_content}<div class="fx-pagehead__lead">{attribute_view_gui attribute=$node.data_map.short_description}</div>{/if}
    </header>
    <ul class="fx-gallery fx-gallery--page" data-fx-lightbox role="list">
    {foreach $children as $i => $child}{include uri='design:parts/ezflow/tile.tpl' node=$child eager=$i|lt( 2 )}{/foreach}
    </ul>
    {if $node.data_map.description.has_content}<div class="fx-prose fx-section fx-caption">{attribute_view_gui attribute=$node.data_map.description}</div>{/if}
    {include name=navigator uri='design:navigator/google.tpl' page_uri=$node.url_alias item_count=$children_count view_parameters=$view_parameters item_limit=$page_limit}
</div>
{undef $page_limit $children $children_count}
