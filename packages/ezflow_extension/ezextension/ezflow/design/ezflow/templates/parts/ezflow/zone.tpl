{* One zone of a frontpage: its blocks in order. Parameters: zone, name (top, left, right, bottom, main, side). *}
<div class="fx-zone fx-zone--{$name}">
{if and( is_set( $zone.blocks ), $zone.blocks|count() )}
{foreach $zone.blocks as $block}
    {include uri='design:parts/zone_block.tpl' zone=$zone}
{/foreach}
{/if}
</div>
