<div id="ajaxsearchbox" class="tab-container">

<div class="box-header"><div class="box-tc"><div class="box-ml"><div class="box-mr"><div class="box-tl"><div class="box-tr">

<h4>{'Quick search'|i18n( 'design/admin/content/edit' )}</h4>

</div></div></div></div></div></div>

<div class="box-bc"><div class="box-ml"><div class="box-mr"><div class="box-br"><div class="box-bl"><div class="box-content">


<div class="block">
    <label>{'Search phrase'|i18n( 'design/admin/content/edit' )}</label>
    <input id="search-string-{$object.id}" class="textfield" type="text" name="SearchStr" value="" />
    <input name="SearchOffset" type="hidden" value="0"  />
    <input name="SearchLimit" type="hidden" value="10"  />
</div>

<div class="block">
    <input id="search-button-{$object.id}" class="button" type="button" name="SearchButton" value="{'Search'|i18n( 'design/admin/content/edit' )}" />
</div>

<div class="block search-results">
    <div id="search-results-{$object.id}" class="ezflow-search-results">
</div>

{foreach $content_attributes as $content_attribute}
{if eq( $content_attribute.data_type_string, 'ezpage' )}

<div class="block">
<label>{'Select block'|i18n( 'design/admin/content/edit' )}</label>
<select name="zonelist" data-ezflow-add-block="{$content_attribute.id}">
<option>{'Select:'|i18n( 'design/admin/content/edit' )}</option>
{def $zone_id = ''
     $zone_layout = cond( $attribute.content.zone_layout, $attribute.content.zone_layout, '' )
     $zone_name = array()}
    {if $zone_layout|ne( '' )}
        {set $zone_name = ezini( $zone_layout, 'ZoneName', 'zone.ini' )}
    {/if}
    {foreach $content_attribute.content.zones as $index => $zone}
    {if and( is_set( $zone.action ), eq( $zone.action, 'remove' ) )}
        {skip}
    {/if}
    {set $zone_id = $index}
    <optgroup label="{$zone_name[$zone.zone_identifier]}">
        {foreach $zone.blocks as $index => $block}
        <option value="{$zone_id}-{$index}">{$index|inc}: {ezini( $block.type, 'Name', 'block.ini' )}</option>
        {/foreach}
    </optgroup>
    {/foreach}
</select>
</div>

<div class="block">
    <input id="addtoblock" class="button" type="submit" name="CustomActionButton[{$content_attribute.id}_new_item]" value="{'Add to block'|i18n( 'design/admin/content/edit' )}" />
</div>
{/if}
{/foreach}

</div>


</div></div></div></div></div></div>

</div>

{ezscript_require( array( 'ezjsc::jquery', 'ezjsc::jqueryio', 'ezajaxsearch.js', 'ezflow_edit.js' ) )}

{* The quick search settings, read by ezajaxsearch.js when the page is ready (no inline code). *}
{set-block variable=ezflow_result_template}<div class="block"><div class="item-title">{ldelim}title{rdelim}</div><div class="item-published-date">[{ldelim}class_name{rdelim}] {ldelim}date{rdelim}</div><div class="item-selector"><input type="checkbox" value="{ldelim}node_id{rdelim}" name="SelectedNodeIDArray[]" /></div></div>{/set-block}
<div hidden="hidden"
     data-ezflow-ajaxsearch="1"
     data-search-string="#search-string-{$object.id}"
     data-search-button="#search-button-{$object.id}"
     data-search-results="#search-results-{$object.id}"
     data-date-format="shortdatetime"
     data-result-template="{$ezflow_result_template|wash}"></div>

<!-- SEARCH BOX: END -->

