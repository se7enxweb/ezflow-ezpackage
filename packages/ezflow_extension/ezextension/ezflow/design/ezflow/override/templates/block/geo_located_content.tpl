{if and( is_set( $block.custom_attributes.limit ), 
            ne( $block.custom_attributes.limit, '' ) )}
    {def $limit = $block.custom_attributes.limit}
{else}
    {def $limit = '5'}
{/if}

{if and( is_set( $block.custom_attributes.width ), 
            ne( $block.custom_attributes.width, '' ) )}
    {def $width = $block.custom_attributes.width}
{else}
    {def $width = '460'}
{/if}

{if and( is_set( $block.custom_attributes.height ), 
            ne( $block.custom_attributes.height, '' ) )}
    {def $height = $block.custom_attributes.height}
{else}
    {def $height = '600'}
{/if}

{def $locations = fetch( 'content', 'tree', hash( 'parent_node_id', $block.custom_attributes.parent_node_id,
                                                  'class_filter_type', 'include',
                                                  'class_filter_array', array( $block.custom_attributes.class ),
                                                  'sort_by', array( 'published', false() ),
                                                  'limit', $limit ) )
     $attribute = $block.custom_attributes.attribute
     $location = false()
     $index = 0}


<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?key={ezini('SiteSettings','GMapsKey')}&sensor={ezini('GMap', 'UseSensor', 'block.ini')}"></script>

{ezscript_require( 'ezflgmapview.js' )}

{* The locations for javascript/ezflgmapview.js, which draws the map when the page has loaded (no inline code).
   ezflgmapview.js hands the address to infoWindow.setContent(), which reads HTML: it is escaped for HTML. A location
   without a map value is left out. *}
{def $ezflow_points = array()}
{foreach $locations as $location}
    {if is_set( $location.data_map[$attribute] )|not}{continue}{/if}
    {if $location.data_map[$attribute].has_content|not}{continue}{/if}
    {set $ezflow_points = $ezflow_points|merge( array( hash( 'lat', $location.data_map[$attribute].content.latitude,
                                                             'lng', $location.data_map[$attribute].content.longitude,
                                                             'address', $location.data_map[$attribute].content.address|wash ) ) )}
{/foreach}

<h2>{$block.name|wash()}</h2>

<ul>
{foreach $locations as $index => $location}
    <li><a id="ezflb-pointer-{$block.id}-{$index}" href="{$location.url_alias|ezurl('no')}">{$location.name|wash()}</a></li>
{/foreach}
</ul>

<div id="ezflb-map-{$block.id}" style="width: {$width}px; height: {$height}px" data-block-id="{$block.id|wash}" data-ezflow-geomap="{json_encode( $ezflow_points )|wash}"></div>

{undef $limit $width $height $locations $attribute $index $location $ezflow_points}
