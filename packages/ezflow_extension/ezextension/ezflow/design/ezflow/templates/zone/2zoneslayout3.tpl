{* Zone layout 2zoneslayout3.tpl: modern grid (stylesheets/ezflow-site.css .fx-zones). Override keys and zone order are unchanged. *}
<div class="fx-zones  zone-layout-{$zone_layout|downcase()}">
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[0] name='top'}
{include uri='design:parts/ezflow/zone.tpl' zone=$zones[1] name='bottom'}
</div>
