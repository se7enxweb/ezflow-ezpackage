{* Blog post: heading with the blog and the date, the body (its embedded image opens it), tags, the global zone. *}
<article class="fx-article fx-container">
    <header class="fx-article__head">
        <p class="fx-kicker"><a href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a></p>
        <h1>{$node.data_map.title.content|wash}</h1>
        <p class="fx-meta">
            <span>{$node.object.owner.name|wash}</span>
            <time datetime="{first_set( $node.data_map.publication_date.content.timestamp, $node.object.published )|datetime( 'custom', '%Y-%m-%d' )}">{cond( $node.data_map.publication_date.has_content, $node.data_map.publication_date.content.timestamp, $node.object.published )|datetime( 'custom', '%F %j, %Y' )}</time>
        </p>
    </header>
    <div class="fx-article__layout">
        <div class="fx-prose">
            {attribute_view_gui attribute=$node.data_map.body}
            {if $node.data_map.tags.has_content}
            <ul class="fx-tags">{foreach $node.data_map.tags.content.keywords as $fx_kw}<li><a href={concat( '/content/keyword/', $fx_kw|rawurlencode )|ezurl}>{$fx_kw|wash}</a></li>{/foreach}</ul>
            {/if}
            {if $node.data_map.enable_comments.data_int}{include uri='design:parts/ezflow/comments.tpl'}{/if}
        </div>
        <aside class="fx-article__aside">
            {include uri='design:parts/extra_info.tpl'}
        </aside>
    </div>
</article>
