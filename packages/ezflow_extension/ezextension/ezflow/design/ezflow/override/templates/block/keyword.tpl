{* keyword: content tagged with the block's keywords, as a list. *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--compact fx-panel"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl'}
    {if $valid_nodes|count}
    <ul class="fx-list">
    {foreach $valid_nodes as $valid_node}
        <li><a class="fx-list__link" href={$valid_node.url_alias|ezurl}><span class="fx-list__title">{$valid_node.name|wash}</span><span class="fx-list__meta">{$valid_node.class_name|wash}</span></a></li>
    {/foreach}
    </ul>
    {/if}
</section>
{undef $valid_nodes}
