/**
 * Push to block page (Exponential; plain JavaScript, an ES module, needs ezflow_core.js and scheduledialog.js):
 * choose a frontpage, then one of its zones, then one of the zone's blocks from menu buttons filled through the
 * ezflow/get view, and collect the placements in #placement-list. The page carries its settings in
 * data-ezflow-push (JSON: requesturl, nodename, imagepath, nodeid); no inline code.
 */
( function () {
    'use strict';
    if ( window.eZPushToBlock && window.eZPushToBlock.version === 2 ) return;

    /** Menu button: an <input type="button"> that opens a menu built from the options of a hidden <select>. */
    function MenuButton( buttonId, selectId ) {
        var self = this;
        this.button = document.getElementById( buttonId );
        this.select = document.getElementById( selectId );
        this.label = this.button.value;
        this.items = [];
        this.selected = null;
        this.listeners = [];

        this.button.classList.add( 'ezflow-button', 'ezflow-menu-button' );
        this.button.setAttribute( 'aria-haspopup', 'true' );
        this.button.setAttribute( 'aria-expanded', 'false' );
        this.select.hidden = true;

        this.menu = document.createElement( 'div' );
        this.menu.className = 'ezflow-menu';
        this.menu.id = selectId + '-menu';
        this.menu.setAttribute( 'role', 'menu' );
        this.menu.innerHTML = '<div class="bd"><ul></ul></div>';
        this.button.setAttribute( 'aria-controls', this.menu.id );
        document.body.appendChild( this.menu );

        Array.prototype.forEach.call( this.select.options, function ( o ) { self.items.push( { text: o.textContent, value: o.value } ); } );
        this.renderItems();

        this.button.addEventListener( 'click', function ( e ) {
            e.preventDefault();
            if ( self.menu.classList.contains( 'visible' ) ) self.hideMenu();
            else self.showMenu();
        } );
        this.menu.addEventListener( 'click', function ( e ) {
            var a = e.target.closest( 'a' );
            if ( !a ) return;
            e.preventDefault();
            var item = self.items[ parseInt( a.getAttribute( 'data-index' ), 10 ) ];
            self.hideMenu();
            self.selected = item;
            self.select.value = item.value;
            self.listeners.forEach( function ( fn ) { fn.call( self, item ); } );
            self.button.focus();
        } );
        this.menu.addEventListener( 'keydown', function ( e ) {
            var links = Array.prototype.slice.call( self.menu.querySelectorAll( 'a' ) ), i = links.indexOf( document.activeElement );
            if ( e.key === 'Escape' ) { self.hideMenu(); self.button.focus(); }
            else if ( e.key === 'ArrowDown' && links.length ) { e.preventDefault(); links[ ( i + 1 ) % links.length ].focus(); }
            else if ( e.key === 'ArrowUp' && links.length ) { e.preventDefault(); links[ ( i - 1 + links.length ) % links.length ].focus(); }
        } );
        document.addEventListener( 'pointerdown', function ( e ) {
            if ( e.target !== self.button && !self.menu.contains( e.target ) ) self.hideMenu();
        } );
    }
    MenuButton.prototype.renderItems = function () {
        var ul = this.menu.querySelector( 'ul' );
        ul.replaceChildren();
        this.items.forEach( function ( item, i ) {
            var li = document.createElement( 'li' ), a = document.createElement( 'a' );
            li.className = 'ezflow-menuitem';
            li.setAttribute( 'role', 'presentation' );
            a.href = '#';
            a.className = 'ezflow-menuitem-text';
            a.setAttribute( 'role', 'menuitem' );
            a.setAttribute( 'data-index', i );
            a.textContent = item.text;
            li.appendChild( a );
            ul.appendChild( li );
        } );
    };
    MenuButton.prototype.showMenu = function () {
        var o = window.eZFlow.offset( this.button );
        this.menu.style.left = o.left + 'px';
        this.menu.style.top = ( o.top + this.button.offsetHeight ) + 'px';
        this.menu.classList.add( 'visible' );
        this.button.setAttribute( 'aria-expanded', 'true' );
        var first = this.menu.querySelector( 'a' );
        if ( first ) first.focus();
    };
    MenuButton.prototype.hideMenu = function () {
        this.menu.classList.remove( 'visible' );
        this.button.setAttribute( 'aria-expanded', 'false' );
    };
    MenuButton.prototype.onSelect = function ( fn ) { this.listeners.push( fn ); };
    MenuButton.prototype.clear = function () {
        this.items = [];
        this.selected = null;
        this.select.replaceChildren();
        this.renderItems();
    };
    MenuButton.prototype.addItem = function ( text, value ) {
        this.items.push( { text: text, value: value } );
        var o = document.createElement( 'option' );
        o.value = value;
        o.textContent = text;
        this.select.appendChild( o );
    };
    MenuButton.prototype.setLabel = function ( text ) { this.button.value = text; };
    MenuButton.prototype.resetLabel = function () { this.button.value = this.label; };
    window.eZFlowMenuButton = MenuButton;

    var oFrontpageButton, oZoneButton, oBlockButton;
    var ret = { version: 2, cfg: {} };

    var handleRequest = function ( data, b ) {
        window.eZFlow.io.post( ret.cfg.requesturl, data ).then( function ( responseText ) {
            var aResponse = JSON.parse( responseText );
            b.clear();
            aResponse.forEach( function ( item ) { b.addItem( item.name, item.id ); } );
            b.renderItems();
        } ).catch( function () { /* the menu stays as it was */ } );
    };
    var handleFButtonClick = function ( item ) {
        oZoneButton.resetLabel();
        oBlockButton.resetLabel();
        oBlockButton.clear();
        if ( !item ) return;
        handleRequest( { content: 'frontpage', frontpage_node_id: item.value }, oZoneButton );
        oFrontpageButton.setLabel( item.text );
    };
    var handleZButtonClick = function ( item ) {
        if ( !item ) return;
        oZoneButton.setLabel( item.text );
        handleRequest( { content: 'zone', frontpage_node_id: oFrontpageButton.selected.value, zone: item.value, node_id: ret.cfg.nodeid }, oBlockButton );
    };
    var handleBButtonClick = function ( item ) { if ( item ) oBlockButton.setLabel( item.text ); };

    var handlePButtonClick = function () {
        if ( !oFrontpageButton.selected || !oZoneButton.selected || !oBlockButton.selected ) return;
        var list = document.getElementById( 'placement-list' );
        var tBody = list.tBodies && list.tBodies[0] ? list.tBodies[0] : list.firstElementChild;
        var f = oFrontpageButton.selected, z = oZoneButton.selected, b = oBlockButton.selected;
        var id = 'id-' + f.value + '-' + z.value + '-' + b.value;
        if ( document.getElementById( id ) ) return;

        var tr = document.createElement( 'tr' ), tdInput = document.createElement( 'td' ), input = document.createElement( 'input' ),
            tdPlacement = document.createElement( 'td' ), img = document.createElement( 'img' ), span = document.createElement( 'span' ),
            ts = document.createElement( 'input' );
        tr.id = id;
        input.type = 'checkbox';
        input.name = 'Remove';
        input.setAttribute( 'aria-label', f.text + ' / ' + z.text + ' / ' + b.text );
        tdInput.appendChild( input );
        tdPlacement.appendChild( document.createTextNode( f.text + ' / ' + z.text + ' / ' + b.text ) );
        img.className = 'schedule-handler';
        img.alt = ret.cfg.nodename;
        img.title = ret.cfg.nodename;
        img.src = ret.cfg.imagepath;
        img.tabIndex = 0;
        img.setAttribute( 'role', 'button' );
        span.className = 'ts-publication';
        ts.type = 'hidden';
        ts.value = Math.round( Date.now() / 1000 );
        ts.name = 'PlacementTSArray[' + f.value + '][' + z.value + '][' + b.value + ']';
        tdPlacement.append( span, ts, img );
        tr.append( tdInput, tdPlacement );
        tBody.appendChild( tr );
        window.eZFlow.ScheduleDialog.init();
    };
    var handlePRButtonClick = function () {
        document.querySelectorAll( '#placement-list input[type="checkbox"]:checked' ).forEach( function ( c ) { c.closest( 'tr' ).remove(); } );
    };

    ret.init = function () {
        var store = document.getElementById( 'placement-store-button' ), remove = document.getElementById( 'placement-remove-button' ),
            place = document.getElementById( 'placement-button' );
        if ( store ) store.classList.add( 'ezflow-button' );
        if ( remove ) { remove.classList.add( 'ezflow-button' ); remove.addEventListener( 'click', handlePRButtonClick ); }
        if ( place ) { place.classList.add( 'ezflow-button' ); place.addEventListener( 'click', handlePButtonClick ); }
        oFrontpageButton = new MenuButton( 'select-frontpage-button', 'select-frontpage-list' );
        oFrontpageButton.onSelect( handleFButtonClick );
        oZoneButton = new MenuButton( 'select-zone-button', 'select-zone-list' );
        oZoneButton.onSelect( handleZButtonClick );
        oBlockButton = new MenuButton( 'select-block-button', 'select-block-list' );
        oBlockButton.onSelect( handleBButtonClick );
    };
    window.eZPushToBlock = ret;

    window.eZFlow.ready( function () {
        var form = document.querySelector( '[data-ezflow-push]' );
        if ( !form ) return;
        try { ret.cfg = JSON.parse( form.getAttribute( 'data-ezflow-push' ) ); } catch ( e ) { return; }
        ret.init();
    } );
}() );
