{* Article: heading, cover image with its credit, the intro and body, the global zone beside it. *}
<article class="fx-article fx-container">
    <header class="fx-article__head">
        <p class="fx-kicker"><a href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a></p>
        <h1>{$node.data_map.title.content|wash}</h1>
        <p class="fx-meta">
            {if $node.data_map.author.has_content}<span>{$node.data_map.author.content.author_list[0].name|wash}</span>{/if}
            <time datetime="{$node.object.published|datetime( 'custom', '%Y-%m-%d' )}">{$node.object.published|datetime( 'custom', '%F %j, %Y' )}</time>
        </p>
    </header>
    {include uri='design:parts/ezflow/cover.tpl' node=$node}
    <div class="fx-article__layout">
        <div class="fx-prose">
            <div class="fx-article__intro">{attribute_view_gui attribute=$node.data_map.intro}</div>
            {if $node.data_map.body.has_content}{attribute_view_gui attribute=$node.data_map.body}{/if}
            {include uri='design:parts/related_content.tpl'}
            {if $node.data_map.enable_comments.data_int}{include uri='design:parts/ezflow/comments.tpl'}{/if}
        </div>
        <aside class="fx-article__aside">
            {include uri='design:parts/extra_info.tpl'}
        </aside>
    </div>
</article>
