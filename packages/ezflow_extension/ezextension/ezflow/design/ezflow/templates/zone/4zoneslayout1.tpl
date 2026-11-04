{* Zone layout 4zoneslayout1.tpl: modern grid (stylesheets/ezflow-site.css .fx-zones). Override keys and zone order are unchanged. *}
<div class="fx-zones fx-zones--4 zone-layout-{$zone_layout|downcase()}">
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[0] name='left'}
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[1] name='right'}
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[2] name='top'}
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[3] name='bottom'}
</div>
