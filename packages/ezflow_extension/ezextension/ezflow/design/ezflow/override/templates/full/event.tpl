{* Event: when, what kind, the text; a link back to the calendar. *}
{def $fx_e_from = $node.data_map.from_time.content.timestamp
     $fx_e_to   = cond( $node.data_map.to_time.has_content, $node.data_map.to_time.content.timestamp, 0 )}
<article class="fx-article fx-container">
    <header class="fx-article__head">
        <p class="fx-kicker"><a href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a></p>
        <h1>{$node.data_map.title.content|wash}</h1>
    </header>
    <dl class="fx-facts">
        <div><dt>{'From'|i18n( 'design/ezflow/full/event' )}</dt><dd><time datetime="{$fx_e_from|datetime( 'custom', '%Y-%m-%dT%H:%i' )}">{$fx_e_from|datetime( 'custom', '%l, %F %j, %Y, %g:%i %A' )}</time></dd></div>
        {if $fx_e_to}<div><dt>{'To'|i18n( 'design/ezflow/full/event' )}</dt><dd><time datetime="{$fx_e_to|datetime( 'custom', '%Y-%m-%dT%H:%i' )}">{$fx_e_to|datetime( 'custom', '%l, %F %j, %Y, %g:%i %A' )}</time></dd></div>{/if}
        {if $node.data_map.category.has_content}<div><dt>{'Category'|i18n( 'design/ezflow/full/event' )}</dt><dd>{$node.data_map.category.content.keyword_string|wash}</dd></div>{/if}
    </dl>
    <div class="fx-prose">{attribute_view_gui attribute=$node.data_map.text}</div>
    <p class="fx-section"><a class="fx-link-arrow" href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a></p>
</article>
{undef $fx_e_from $fx_e_to}
