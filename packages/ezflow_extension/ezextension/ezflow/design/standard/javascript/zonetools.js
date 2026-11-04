/**
 * Zone layout selector of the page datatype editor (plain JavaScript, an ES module): when the new layout has fewer
 * zones than the current one, the previous zones must be mapped to the new ones before the layout can be set.
 */
( function () {
    'use strict';
    var eZFlow = window.eZFlow = window.eZFlow || {};
    if ( eZFlow.ZoneLayout && eZFlow.ZoneLayout.version === 2 ) return;

    var getSelectedZone = function () {
        return document.querySelector( 'input.zone-type-selector:checked' ) || false;
    };

    var option = function ( value, text ) {
        var o = document.createElement( 'option' );
        o.value = value;
        o.textContent = text;
        return o;
    };

    var validate = function ( e ) {
        var selecZoneTypeElem = getSelectedZone();
        if ( !selecZoneTypeElem ) return;
        var allowedZones = JSON.parse( eZFlow.ZoneLayout.cfg.allowedzones ), selectedZoneType, zoneLayout;
        allowedZones.forEach( function ( allowedZone ) {
            if ( allowedZone.type == selecZoneTypeElem.value ) selectedZoneType = allowedZone;
            if ( allowedZone.type == eZFlow.ZoneLayout.cfg.zonelayout ) zoneLayout = allowedZone;
        } );
        if ( !selectedZoneType || !zoneLayout ) return;

        var zoneCountDiff = selectedZoneType.zones.length < zoneLayout.zones.length ? zoneLayout.zones.length - selectedZoneType.zones.length : 0;
        var zoneMapContainer = document.getElementById( 'zone-map-container' );
        var zoneMapPlaceholder = document.getElementById( 'zone-map-placeholder' );
        var typeClass = 'type_' + selectedZoneType.type;

        if ( zoneCountDiff !== 0 && !zoneMapPlaceholder.classList.contains( typeClass ) ) {
            zoneMapPlaceholder.className = typeClass;
            zoneMapContainer.classList.remove( 'hide' );
            zoneMapContainer.classList.add( 'show' );

            var typeLabel = document.createElement( 'p' );
            typeLabel.className = 'zone-map-type';
            typeLabel.textContent = selectedZoneType.name + ' [' + selectedZoneType.type + ']';
            document.getElementById( 'zone-map-type' ).replaceChildren( typeLabel );

            zoneMapPlaceholder.replaceChildren();
            selectedZoneType.zones.forEach( function ( selZone ) {
                var item = document.createElement( 'div' ), label = document.createElement( 'label' ), select = document.createElement( 'select' );
                item.className = 'zone-map-item';
                select.id = 'zone-map-' + selZone.id;
                label.htmlFor = select.id;
                label.textContent = selZone.name;
                select.name = 'ContentObjectAttribute_ezpage_zone_map[' + selZone.id + ']';
                zoneLayout.zones.forEach( function ( currZone ) { select.appendChild( option( currZone.id, currZone.name ) ); } );
                item.append( label, select );
                zoneMapPlaceholder.appendChild( item );
            } );
            e.preventDefault();
            var first = zoneMapPlaceholder.querySelector( 'select' );
            if ( first ) first.focus();
            return;
        }

        if ( zoneCountDiff !== 0 && zoneMapPlaceholder.classList.contains( typeClass ) ) {
            var seen = {};
            document.querySelectorAll( '#zone-map-container select' ).forEach( function ( select ) {
                var value = select.value;
                if ( seen[value] ) e.preventDefault();
                else seen[value] = true;
            } );
        }
    };

    eZFlow.ZoneLayout = {
        version: 2,
        init: function () {
            var button = document.getElementById( 'set-zone-layout' );
            if ( button && !button.__ezflowZone ) {
                button.__ezflowZone = true;
                button.addEventListener( 'click', validate );
            }
        },
        cfg: {}
    };
}() );
