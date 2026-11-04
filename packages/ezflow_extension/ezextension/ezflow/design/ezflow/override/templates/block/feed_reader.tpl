{* feed_reader: the newest entries of an RSS or Atom feed (cached for five minutes). *}
{cache-block expiry=300 keys=array( $block.custom_attributes.source, $block.custom_attributes.limit, $block.custom_attributes.offset )}
{def $res = feedreader( $block.custom_attributes.source, $block.custom_attributes.limit, $block.custom_attributes.offset )}
<section class="fx-block fx-block--compact fx-panel">
    <header class="fx-block__head"><h2 class="fx-block__title">{if $res.links[0]}<a href="{$res.links[0]|wash}">{cond( $block.name|trim, $block.name, $res.title )|wash}</a>{else}{cond( $block.name|trim, $block.name, $res.title )|wash}{/if}</h2></header>
    <ul class="fx-feed">
    {foreach $res.items as $item}
        <li><a href="{$item.links[0]|wash}">{$item.title|wash}</a></li>
    {/foreach}
    </ul>
</section>
{undef $res}
{/cache-block}
