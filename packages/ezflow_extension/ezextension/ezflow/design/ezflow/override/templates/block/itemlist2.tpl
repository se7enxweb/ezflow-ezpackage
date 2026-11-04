{* itemlist2: the block's items as a list in 2 columns. *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--list"{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    {include uri='design:parts/ezflow/block_head.tpl' more=cond( $valid_nodes|count, $valid_nodes[0].parent, false() )}
    <ul class="fx-list fx-list--cols fx-list--cols-2">
    {foreach $valid_nodes as $valid_node}
        <li><a class="fx-list__link" href={$valid_node.url_alias|ezurl}><span class="fx-list__title">{$valid_node.name|wash}</span><span class="fx-list__meta">{$valid_node.object.published|datetime( 'custom', '%M %j, %Y' )}</span></a></li>
    {/foreach}
    </ul>
</section>
{undef $valid_nodes}
