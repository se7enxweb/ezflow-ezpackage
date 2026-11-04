{* Frontpage: its zone layout and blocks. A frontpage below the root gets a short heading first. *}
<div class="fx-frontpage{if $node.node_id|eq( ezini( 'NodeSettings', 'RootNode', 'content.ini' ) )} fx-frontpage--home{/if} fx-container">
    {if $node.node_id|ne( ezini( 'NodeSettings', 'RootNode', 'content.ini' ) )}
    <header class="fx-pagehead fx-sr-only"><h1>{$node.name|wash}</h1></header>
    {else}
    <h1 class="fx-sr-only">{$node.name|wash}</h1>
    {/if}
    {attribute_view_gui attribute=$node.data_map.page}
</div>
