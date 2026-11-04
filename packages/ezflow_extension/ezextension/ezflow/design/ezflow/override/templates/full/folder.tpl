{* Folder: a heading with the folder's description, then its children as cards (paged). *}
{def $page_limit = 12
     $fx_classes = ezini( 'MenuContentSettings', 'ExtraIdentifierList', 'menu.ini' )
     $children = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'offset', $view_parameters.offset, 'limit', $page_limit, 'sort_by', $node.sort_array ) )
     $children_count = fetch( 'content', 'list_count', hash( 'parent_node_id', $node.node_id ) )}
<div class="fx-container">
    <header class="fx-pagehead">
        <p class="fx-kicker">{if $node.depth|gt( 2 )}<a href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a>{else}{$node.class_name|wash}{/if}</p>
        <h1>{$node.name|wash}</h1>
        {if $node.data_map.short_description.has_content}<div class="fx-pagehead__lead">{attribute_view_gui attribute=$node.data_map.short_description}</div>{/if}
    </header>
    {if $node.data_map.description.has_content}<div class="fx-prose fx-section">{attribute_view_gui attribute=$node.data_map.description}</div>{/if}
    {if or( $node.data_map.show_children.data_int, $node.data_map.show_children.has_content|not )}
    <div class="fx-listing">
    {foreach $children as $child}
        {include uri='design:parts/ezflow/card.tpl' node=$child level=2 meta=eq( $child.class_identifier, 'article' )}
    {/foreach}
    </div>
    {include name=navigator uri='design:navigator/google.tpl' page_uri=$node.url_alias item_count=$children_count view_parameters=$view_parameters item_limit=$page_limit}
    {/if}
</div>
{undef $page_limit $fx_classes $children $children_count}
