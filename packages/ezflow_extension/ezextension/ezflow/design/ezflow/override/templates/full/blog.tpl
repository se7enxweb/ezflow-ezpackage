{* Blog: its description, then the posts as cards, newest first (paged). *}
{def $page_limit = 12
     $children = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'offset', $view_parameters.offset, 'limit', $page_limit,
                                                 'class_filter_type', 'include', 'class_filter_array', array( 'blog_post' ), 'sort_by', array( 'published', false() ) ) )
     $children_count = fetch( 'content', 'list_count', hash( 'parent_node_id', $node.node_id, 'class_filter_type', 'include', 'class_filter_array', array( 'blog_post' ) ) )}
<div class="fx-container">
    <header class="fx-pagehead">
        <p class="fx-kicker">{$node.class_name|wash}</p>
        <h1>{$node.name|wash}</h1>
        {if $node.data_map.description.has_content}<div class="fx-pagehead__lead">{attribute_view_gui attribute=$node.data_map.description}</div>{/if}
    </header>
    <div class="fx-listing">
    {foreach $children as $child}
        {include uri='design:parts/ezflow/card.tpl' node=$child level=2 meta=true()}
    {/foreach}
    </div>
    {include name=navigator uri='design:navigator/google.tpl' page_uri=$node.url_alias item_count=$children_count view_parameters=$view_parameters item_limit=$page_limit}
</div>
{undef $page_limit $children $children_count}
