/**
 * @author ls
 *
 * Zone layout selector of the page datatype editor: when the new layout has
 * fewer zones than the current one, the previous zones must be mapped to the
 * new ones before the layout can be set. Requires jQuery.
 */

var eZFlow = window.eZFlow || {};
window.eZFlow = eZFlow;

eZFlow.ZoneLayout = function( $ ) {

    // Private

    var getSelectedZone = function() {
        var selectedZone = false;
        var selectedZoneArray = $( 'input' ).filter( function() {
            return this.className == "zone-type-selector" && this.checked;
        } );

        if( selectedZoneArray[0] ) {
            selectedZone = selectedZoneArray[0];
        }
        return selectedZone;
    };

    var setValidatorListener = function() {
        var zoneLayoutButton = document.getElementById("set-zone-layout");

        if(zoneLayoutButton) {
            $( zoneLayoutButton ).on( "click", validate );
        }
    };

    var objectConv = function(a) {
        var o = {};
        for (var i = 0; i < a.length; i++) {
            o[a[i]] = '';
        }
        return o;
    };

    var validate = function(e) {
        var selecZoneTypeElem = getSelectedZone();
        var allowedZones = JSON.parse(eZFlow.ZoneLayout.cfg.allowedzones);
        var allowedZoneCount = allowedZones.length;
        var selectedZoneType, zoneLayout;

        for(var i=0; i<allowedZoneCount; i++) {
            var allowedZone = allowedZones[i];

            if(allowedZone.type == selecZoneTypeElem.value) {
                selectedZoneType = allowedZone;
            }

            if(allowedZone.type == eZFlow.ZoneLayout.cfg.zonelayout) {
                zoneLayout = allowedZone;
            }
        }

        var zoneCountDiff = 0;
        var allowedZonesCount = selectedZoneType.zones.length;
        var existingZoneCount = zoneLayout.zones.length;

        if ( allowedZonesCount < existingZoneCount )
            zoneCountDiff = existingZoneCount - allowedZonesCount;

        var zoneMapContainer = document.getElementById('zone-map-container');
        var zoneMapPlaceholder = document.getElementById('zone-map-placeholder');

        if ( zoneCountDiff != 0 && !$( zoneMapPlaceholder ).hasClass( 'type_' + selectedZoneType.type ) ) {
            zoneMapPlaceholder.className = '';
            $( zoneMapPlaceholder ).addClass( 'type_' + selectedZoneType.type );
            $( zoneMapContainer ).removeClass( 'hide' ).addClass( 'show' );

            document.getElementById('zone-map-type').innerHTML = '<p class="zone-map-type">' + selectedZoneType.name + ' [' + selectedZoneType.type + ']</p>';

            var html = '';
            var currZones = zoneLayout.zones;
            var currZonesCount = zoneLayout.zones.length;
            var selZones = selectedZoneType.zones;
            var selZoneCount = selectedZoneType.zones.length;

            for(var k=0; k<selZoneCount; k++) {
                var selZone = selZones[k];
                html += '<div class="zone-map-item">';
                html += '<label>' + selZone.name + '</label>';
                html += '<select name="ContentObjectAttribute_ezpage_zone_map[' + selZone.id + ']">';

                for(var j=0; j<currZonesCount; j++) {
                    var currZone = currZones[j];
                    html += '<option value="' + currZone.id  + '">';
                    html += currZone.name;
                    html += '</option>';
                }

                html += '</select>';
                html += '</div>';
            }

            zoneMapPlaceholder.innerHTML = html;
            e.preventDefault();
        }

        if (zoneCountDiff != 0 && $( zoneMapPlaceholder ).hasClass( 'type_' + selectedZoneType.type )) {
            var zoneIDArray = [];
            var selectElements = $( '#zone-map-container select' ).get();

            var selectElementsCount = selectElements.length;
            for (var m = 0; m < selectElementsCount; m++) {
                var selectElement = selectElements[m];
                var selectedIndex = selectElement.selectedIndex;
                var selectedValue = selectElement[selectedIndex].value;

                if (selectedValue in objectConv(zoneIDArray)) {
                    e.preventDefault();
                }
                else {
                    zoneIDArray.push(selectedValue);
                }
            }
        }
    };

    // Public

    return {

        init: function() {
            setValidatorListener();
        },

        cfg: {}

    };

}( jQuery );
