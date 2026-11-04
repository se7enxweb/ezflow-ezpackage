{* The global zone (the first global_layout object of the site): its blocks beside articles and posts. *}
{def $global_layout_object = fetch( 'content', 'tree', hash( 'parent_node_id', 1, 'limit', 1,
                                                             'class_filter_type', include, 'class_filter_array', array( 'global_layout' ) ) )}
{if $global_layout_object}
    {attribute_view_gui attribute=$global_layout_object[0].data_map.page}
{/if}
{undef $global_layout_object}
