{* tag_cloud: the keywords of the block's subtree. *}
<section class="fx-block fx-block--compact fx-panel"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    {if is_set( $block.custom_attributes.subtree_node_id )}
        {eztagcloud( hash( 'parent_node_id', $block.custom_attributes.subtree_node_id ) )}
    {/if}
</section>
