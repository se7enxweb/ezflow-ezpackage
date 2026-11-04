{* Zone layout 2zoneslayout2.tpl: modern grid (stylesheets/ezflow-site.css .fx-zones). Override keys and zone order are unchanged. *}
<div class="fx-zones fx-zones--2col-r zone-layout-{$zone_layout|downcase()}">
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[0] name='side'}
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[1] name='right'}
</div>
