{def $zone_id = ''
     $block_id = ''
     $item_id = ''
     $zone_names = array()
     $zone_layout = cond( $attribute.content.zone_layout, $attribute.content.zone_layout, '' )
     $allowed_zones = fetch('ezflow', 'allowed_zones')
     $can_change_layout = fetch( 'user', 'has_access_to', hash( 'module', 'ezflow', 'function', 'changelayout' ) )
     $current_user = fetch( 'user', 'current_user' )
     $content_object = fetch( 'content', 'object', hash( 'object_id', $attribute.contentobject_id ) )
     $policies = fetch( 'user', 'user_role', hash( 'user_id', $current_user.contentobject_id ) )
     $layout_for_current_class = false()}

     {foreach $policies as $policy}
        {if and( eq( $policy.moduleName, 'ezflow' ),
                    eq( $policy.functionName, 'changelayout' ),
                        is_array( $policy.limitation ) )}
            {if $policy.limitation[0].values_as_array|contains( $content_object.content_class.id )}
                {set $layout_for_current_class = true()}
            {/if}
        {elseif or( and( eq( $policy.moduleName, '*' ),
                             eq( $policy.functionName, '*' ),
                                 eq( $policy.limitation, '*' ) ),
                    and( eq( $policy.moduleName, 'ezflow' ),
                             eq( $policy.functionName, '*' ),
                                 eq( $policy.limitation, '*' ) ),
                    and( eq( $policy.moduleName, 'ezflow' ),
                             eq( $policy.functionName, 'changelayout' ),
                                 eq( $policy.limitation, '*' ) ) )}
            {set $layout_for_current_class = true()}
        {/if}
     {/foreach}

    {if $zone_layout|ne( '' )}
        {set $zone_names = ezini( $zone_layout, 'ZoneName', 'zone.ini' )}
    {/if}

{* The zone layout and the zone tabs, for javascript/ezflow_edit.js (no inline code): one tab per zone, its content
   loaded once from the ezflow/zone view, with the settings of the block tools. *}
{def $ezflow_tabs = array()}
{foreach $attribute.content.zones as $index => $zone}
    {if and( is_set( $zone.action ), eq( $zone.action, 'remove' ) )}
        {skip}
    {/if}
    {set $ezflow_tabs = $ezflow_tabs|merge( array( hash( 'label', $zone_names[$zone.zone_identifier],
                                                          'dataSrc', concat( '/ezflow/zone/', $attribute.id, '/', $attribute.version, '/', $index )|ezurl( 'no' ) ) ) )}
{/foreach}
<div id="page-datatype-container" class="ezpage-tabs-skin" data-ezflow-page="{json_encode( hash( 'allowedzones', $allowed_zones|json(),
                                                                                                 'zonelayout', $zone_layout,
                                                                                                 'tabs', $ezflow_tabs,
                                                                                                 'blockCfg', hash( 'url', 'ezflow/request'|ezurl( 'no' ),
                                                                                                                   'attributeid', $attribute.id,
                                                                                                                   'version', $attribute.version ) ) )|wash}">
{undef $ezflow_tabs}
{if and( $can_change_layout, $layout_for_current_class )}
<div class="zones float-break">
{foreach $allowed_zones as $allowed_zone}
{if $allowed_zone['classes']|contains( $attribute.object.content_class.identifier )}
    <div class="zone">
        <div class="zone-label">{$allowed_zone['name']|wash()}</div>
        <div class="zone-thumbnail"><img src={concat( "ezpage/thumbnails/", $allowed_zone['thumbnail'] )|ezimage()} alt="{$allowed_zone['name']|wash()}" /></div>
        <div class="zone-selector">
            <input type="radio" class="zone-type-selector" name="ContentObjectAttribute_ezpage_zone_allowed_type_{$attribute.id}" value="{$allowed_zone['type']}" {if eq( $allowed_zone['type'], $zone_layout )}checked="checked"{/if} />
        </div>
    </div>
{/if}
{/foreach}
    <div class="break"></div>

    <div id="zone-map-container" class="hide float-break">
        <div id="zone-map-type"></div>
        <p>{'The total number of zones in the new layout is less than the number of zones in the previous layout. Therefore, you must map the previous zones to new zones. Unmapped zones will be removed!'|i18n( 'design/standard/datatype/ezpage' )}</p>
        <div id="zone-map-placeholder"></div>
    </div>

    <div class="block">
        <input id="set-zone-layout" class="button" type="submit" name="CustomActionButton[{$attribute.id}_new_zone_layout]" value="{'Set layout'|i18n( 'design/standard/datatype/ezpage' )}" />
    </div>
    <input type="hidden" class="current-zone-count" name="ContentObjectAttribute_ezpage_zone_count_{$attribute.id}" value="{$attribute.content.zones|count()}" />
</div>
{/if}
<div id="zone-tabs-container"></div>
</div>

{ezscript_require( array( 'ezjsc::jquery', 'ezjsc::jqueryio', 'ezflowcalendar.js', 'blocktools.js', 'zonetools.js', 'scheduledialog.js', 'ezflow_edit.js' ) )}
{ezcss_require( array( 'ezflowwidgets.css', 'scheduledialog.css', 'ezpage/ezpage.css' ) )}