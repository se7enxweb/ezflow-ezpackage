function eZFLGMapView( blockId, data ){
    var bounds = new google.maps.LatLngBounds();

    var map = new google.maps.Map(
        document.getElementById('ezflb-map-' + blockId), {
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

    for(var i = 0; i < data.length; i++){
        var locationData = data[i];

        var pointerHandler = document.getElementById('ezflb-pointer-' + blockId + '-' + i);
        if ( pointerHandler )
        {
            pointerHandler.point = locationData.point;
            pointerHandler.address = locationData.address;

            eZFLGMapAddListener( pointerHandler, 'click', function(e) {
                map.panTo(this.point);
                map.setCenter(this.point, 13);

                var infoWindow = new google.maps.InfoWindow();
                infoWindow.setContent(this.address);
                infoWindow.setPosition(this.point);
                infoWindow.open(map);

                e.preventDefault();
            } );
        }

        var marker = new google.maps.Marker({
            position: locationData.point,
            map: map
        });

        marker.setMap(map);
        bounds.extend( locationData.point );

        google.maps.event.addListener( marker, 'click', function() {
            var infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(locationData.address);
            infoWindow.setPosition(locationData.point);
            infoWindow.open(map);
        } );
    }

    map.fitBounds(bounds);
}

function eZFLGMapAddListener( element, type, expression, bubbling )
{
    bubbling = bubbling || false;

    if( window.addEventListener )
    {
        element.addEventListener( type, expression, bubbling );
        return true;
    } 
    else if ( window.attachEvent ) 
    {
        element.attachEvent( 'on' + type, expression );
        return true;
    } 
    else
    {
        return false;
    }
}
/*
 * Templates without inline code: the map of block/geo_located_content.tpl carries its locations in
 * data-ezflow-geomap (JSON: [{lat, lng, address}], address already escaped for HTML) and data-block-id; the map is
 * drawn when the page has loaded, the way the inline script did. Set up once, however often this file is printed.
 */
( function()
{
    if ( window.eZFLGMapDataSetup ) return;
    window.eZFLGMapDataSetup = true;

    eZFLGMapAddListener( window, 'load', function()
    {
        if ( !window.google || !google.maps ) return;
        var maps = document.querySelectorAll( '[data-ezflow-geomap]' );
        for ( var i = 0; i < maps.length; i++ )
        {
            var list;
            try
            {
                list = JSON.parse( maps[i].getAttribute( 'data-ezflow-geomap' ) );
            }
            catch ( e )
            {
                continue;
            }
            var data = [];
            for ( var k = 0; k < list.length; k++ )
            {
                data.push( { point: new google.maps.LatLng( parseFloat( list[k].lat ), parseFloat( list[k].lng ) ),
                             address: list[k].address } );
            }
            eZFLGMapView( maps[i].getAttribute( 'data-block-id' ), data );
        }
    }, false );
} )();
