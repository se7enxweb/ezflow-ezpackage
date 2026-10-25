{def $key = $block.custom_attributes.key
     $location = $block.custom_attributes.location}

{ezscript_require( array( 'ezjsc::jquery', 'ezflow_blocks.js' ) )}

<h1>{$block.name|wash()}</h1>

{* The map is centered on the location by javascript/ezflow_blocks.js (no inline code). *}
<div id="map-container-{$block.id}" class="map-container" data-ezflow-gmap-location="{$location|wash}"></div>

{* 
    Do not load GMap API if key is empty. 
    Option to skip loading GMap API in case when it was loaded globally e.g in <head> section
*}
{if ne( $key, '' )}
    <script type="text/javascript" src="//maps.googleapis.com/maps/api/js?key={$key}&sensor={ezini('GMap', 'UseSensor', 'block.ini')}"></script>
{/if}


{undef $key $location}