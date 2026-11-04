{* video: the block's video item, played by the browser (<video>, no plug-in), with its thumbnail as the poster. *}
{def $flash_node = $block.valid_nodes[0]}
{if and( $flash_node, is_set( $flash_node.data_map.file ), $flash_node.data_map.file.has_content )}
{def $attribute_file = $flash_node.data_map.file}
<section class="fx-block fx-block--video"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    <video class="fx-video" controls preload="metadata"{if and( is_set( $flash_node.data_map.thumbnail ), $flash_node.data_map.thumbnail.has_content )} poster={$flash_node.data_map.thumbnail.content['fx_wide'].url|ezroot}{/if}>
        <source src={concat( "content/download/", $attribute_file.contentobject_id, "/", $attribute_file.id )|ezurl} type="{$attribute_file.content.mime_type|wash}">
        <a href={$flash_node.url_alias|ezurl}>{$flash_node.name|wash}</a>
    </video>
</section>
{undef $attribute_file}
{/if}
{undef $flash_node}
