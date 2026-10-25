/**
 * Push to block page (Exponential, jQuery): choose a frontpage, then one of
 * its zones, then one of the zone's blocks from menu buttons filled through
 * the ezflow/get view, and collect the placements in #placement-list.
 * Requires jQuery and scheduledialog.js.
 */

/**
 * Menu button: an <input type="button"> that opens a menu built from the
 * options of a <select> (which is hidden and kept in step with the choice).
 */
var eZFlowMenuButton = (function( $ ) {

    function MenuButton( buttonId, selectId )
    {
        var self = this;

        this.button = document.getElementById( buttonId );
        this.select = document.getElementById( selectId );
        this.label = this.button.value;
        this.items = [];
        this.selected = null;
        this.listeners = [];

        $( this.button ).addClass( 'ezflow-button ezflow-menu-button' ).attr( { 'aria-haspopup': 'true', 'aria-expanded': 'false' } );
        $( this.select ).hide();

        this.menu = $( '<div class="ezflow-menu" role="menu"><div class="bd"><ul></ul></div></div>' )
            .attr( 'id', selectId + '-menu' )
            .appendTo( document.body )[0];

        $( this.select ).children( 'option' ).each( function() {
            self.items.push( { text: $( this ).text(), value: this.value } );
        } );
        this.renderItems();

        $( this.button ).on( 'click', function( e ) {
            e.preventDefault();
            if ( $( self.menu ).hasClass( 'visible' ) ) {
                self.hideMenu();
            } else {
                self.showMenu();
            }
        } );

        $( this.menu ).on( 'click', 'a', function( e ) {
            e.preventDefault();
            var item = self.items[ parseInt( this.getAttribute( 'data-index' ), 10 ) ];
            self.hideMenu();
            self.selected = item;
            self.select.value = item.value;
            for ( var i = 0; i < self.listeners.length; i++ ) {
                self.listeners[i].call( self, item );
            }
        } ).on( 'keydown', function( e ) {
            if ( e.which === 27 ) {
                self.hideMenu();
                self.button.focus();
            }
        } );

        $( document ).on( 'mousedown', function( e ) {
            if ( e.target !== self.button && !$.contains( self.menu, e.target ) ) {
                self.hideMenu();
            }
        } );
    }

    MenuButton.prototype.renderItems = function()
    {
        var ul = $( this.menu ).find( 'ul' ).empty(), i;

        for ( i = 0; i < this.items.length; i++ ) {
            $( '<li class="ezflow-menuitem" role="presentation"></li>' )
                .append( $( '<a href="#" class="ezflow-menuitem-text" role="menuitem"></a>' )
                    .attr( 'data-index', i )
                    .text( this.items[i].text ) )
                .appendTo( ul );
        }
    };

    MenuButton.prototype.showMenu = function()
    {
        var o = $( this.button ).offset();

        $( this.menu ).css( { left: o.left + 'px', top: ( o.top + $( this.button ).outerHeight() ) + 'px' } ).addClass( 'visible' );
        $( this.button ).attr( 'aria-expanded', 'true' );
    };

    MenuButton.prototype.hideMenu = function()
    {
        $( this.menu ).removeClass( 'visible' );
        $( this.button ).attr( 'aria-expanded', 'false' );
    };

    MenuButton.prototype.onSelect = function( fn )
    {
        this.listeners.push( fn );
    };

    MenuButton.prototype.clear = function()
    {
        this.items = [];
        this.selected = null;
        $( this.select ).empty();
        this.renderItems();
    };

    MenuButton.prototype.addItem = function( text, value )
    {
        this.items.push( { text: text, value: value } );
        $( '<option></option>' ).val( value ).text( text ).appendTo( this.select );
    };

    MenuButton.prototype.setLabel = function( text )
    {
        this.button.value = text;
    };

    MenuButton.prototype.resetLabel = function()
    {
        this.button.value = this.label;
    };

    return MenuButton;
})( jQuery );

var eZPushToBlock = function( $ ) {

    var oFrontpageButton,
        oZoneButton,
        oBlockButton;

    var ret = {};

    var clearMenuContent = function(b) {
        b.clear();
    };

    var handleRequest = function(p, b) {
        var handleSuccess = function(responseText) {
            if(responseText !== undefined) {
                var aResponse = JSON.parse( responseText );
                clearMenuContent( b );

                for(var i = 0; i < aResponse.length; i++) {
                    var oResItem = aResponse[i];
                    b.addItem( oResItem.name, oResItem.id );
                }

                b.renderItems();
            }
        };

        var _tokenNode = document.getElementById('ezxform_token_js');
        if ( _tokenNode ) {
            if ( p ) {
                p = p + '&';
            }
            p = p + 'ezxform_token=' + _tokenNode.getAttribute('title');
        }

        $.ajax( { type: 'POST', url: ret.cfg.requesturl, data: p, dataType: 'text', success: handleSuccess } );
    };

    var handleFButtonClick = function (oMenuItem) {
        oZoneButton.resetLabel();
        oBlockButton.resetLabel();
        clearMenuContent( oBlockButton );

        if (oMenuItem) {
            var sPostData = "content=frontpage&frontpage_node_id=" + oMenuItem.value;

            handleRequest( sPostData, oZoneButton );

            oFrontpageButton.setLabel( oMenuItem.text );
        }
    };

    var handleZButtonClick = function (oMenuItem) {
        if (oMenuItem) {
            oZoneButton.setLabel( oMenuItem.text );
            var nodeID = oFrontpageButton.selected.value;
            var sPostData = "content=zone&frontpage_node_id=" + nodeID + "&zone=" + oMenuItem.value + "&node_id=" + ret.cfg.nodeid;

            handleRequest( sPostData, oBlockButton );
        }
    };

    var handleBButtonClick = function (oMenuItem) {
        if (oMenuItem) {
            oBlockButton.setLabel( oMenuItem.text );
        }
    };

    var handlePButtonClick = function() {
        if ( !oFrontpageButton.selected || !oZoneButton.selected || !oBlockButton.selected ) {
            return;
        }

        var oPlacementList = document.getElementById("placement-list");
        var tBody = $( oPlacementList ).children( 'tbody' )[0] || oPlacementList.firstElementChild;

        var sFrontpageText = oFrontpageButton.selected.text;
        var sZoneText = oZoneButton.selected.text;
        var sBlockText = oBlockButton.selected.text;

        var sID = "id-" + oFrontpageButton.selected.value + "-" + oZoneButton.selected.value + "-" + oBlockButton.selected.value;

        var oCurrTr = document.getElementById( sID );

        if (oCurrTr === null) {
            var oTr = document.createElement("tr");
            oTr.id = sID;

            var oTdInput = document.createElement("td");
            var oInput = document.createElement("input");
            oInput.type = "checkbox";
            oInput.name = "Remove"; // TODO: add the correct name

            oTdInput.appendChild( oInput );

            var oTdPlacement = document.createElement("td");
            oTdPlacement.appendChild( document.createTextNode( sFrontpageText + " / " + sZoneText + " / " + sBlockText  ) );

            var oImg = document.createElement("img");
            oImg.className = "schedule-handler";
            oImg.alt = ret.cfg.nodename;
            oImg.title = ret.cfg.nodename;
            oImg.src = ret.cfg.imagepath;

            var oSpan = document.createElement("span");
            oSpan.className = "ts-publication";

            var oTSInput = document.createElement("input");
            oTSInput.type = "hidden";
            oTSInput.value = Math.round( new Date().getTime() / 1000 );
            oTSInput.name = "PlacementTSArray[" + oFrontpageButton.selected.value + "][" + oZoneButton.selected.value + "][" + oBlockButton.selected.value + "]";

            oTdPlacement.appendChild(oSpan);
            oTdPlacement.appendChild(oTSInput);
            oTdPlacement.appendChild(oImg);

            oTr.appendChild( oTdInput );
            oTr.appendChild( oTdPlacement );

            tBody.appendChild( oTr );

            eZFlow.ScheduleDialog.init();
        }
    };

    var handlePRButtonClick = function() {
        var oPlacementList = document.getElementById("placement-list");

        $( oPlacementList ).find( 'input[type="checkbox"]' ).filter( ':checked' ).each( function() {
            $( this ).closest( 'tr' ).remove();
        } );
    };

    ret.cfg = {};

    ret.init = function() {
        $( '#placement-store-button' ).addClass( 'ezflow-button' );

        $( '#placement-remove-button' ).addClass( 'ezflow-button' ).on( 'click', handlePRButtonClick );

        $( '#placement-button' ).addClass( 'ezflow-button' ).on( 'click', handlePButtonClick );

        oFrontpageButton = new eZFlowMenuButton( "select-frontpage-button", "select-frontpage-list" );
        oFrontpageButton.onSelect( handleFButtonClick );

        oZoneButton = new eZFlowMenuButton( "select-zone-button", "select-zone-list" );
        oZoneButton.onSelect( handleZButtonClick );

        oBlockButton = new eZFlowMenuButton( "select-block-button", "select-block-list" );
        oBlockButton.onSelect( handleBButtonClick );
    };

    return ret;

}( jQuery );

/*
 * Templates without inline code: the push form (page/push.tpl) carries its settings in data-ezflow-push (JSON:
 * requesturl, nodename, imagepath, nodeid) and the placement tools start from them when the page is ready, the way
 * the inline "eZPushToBlock.cfg = { ... }; eZPushToBlock.init();" did. Set up once, however often this file is printed.
 */
( function( $ )
{
    if ( eZPushToBlock.dataSetup ) return;
    eZPushToBlock.dataSetup = true;

    $( function()
    {
        var form = $( '[data-ezflow-push]' ).first();
        if ( !form.length ) return;
        try
        {
            eZPushToBlock.cfg = JSON.parse( form.attr( 'data-ezflow-push' ) );
        }
        catch ( e )
        {
            return;
        }
        eZPushToBlock.init();
    } );
} )( jQuery );
