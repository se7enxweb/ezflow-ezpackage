/**
 * AJAX search of the frontpage edit views (Exponential; plain JavaScript, an ES module, needs ezflow_core.js).
 *
 *   eZAJAXSearch.cfg = { searchstring: '#id', searchbutton: '#id', searchresults: '#id',
 *                        resulttemplate: '...', noresulttemplate: '...', dateformattype: 'shortdatetime',
 *                        customSearchAttributes: [ '#id', ... ], backendUri: 'ezjsc::search' };
 *   eZAJAXSearch.init();
 *
 * Templates without inline code carry the settings on an element with data-ezflow-ajaxsearch (data-search-string,
 * data-search-button, data-search-results, data-date-format, data-result-template, data-noresult-template,
 * data-backend-uri; data-custom-search-attributes as a JSON list of selectors) and the search starts from them.
 * The values put into the result templates are escaped for HTML.
 */
( function () {
    'use strict';
    if ( window.eZAJAXSearch && window.eZAJAXSearch.version === 2 ) return;

    var escape = function ( v ) {
        return String( v === undefined || v === null ? '' : v ).replace( /[&<>"']/g, function ( c ) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        } );
    };

    var valueOf = function ( sel ) {
        var nodes = document.querySelectorAll( sel ), node = nodes[0];
        if ( !node ) return null;
        if ( node.nodeName.toLowerCase() === 'input' && ( node.type === 'radio' || node.type === 'checkbox' ) ) {
            var checked = Array.prototype.filter.call( nodes, function ( n ) { return n.checked; } )[0];
            return checked ? checked.value : null;
        }
        if ( node.nodeName.toLowerCase() === 'select' && node.multiple ) {
            return Array.prototype.filter.call( node.options, function ( o ) { return o.selected; } ).map( function ( o ) { return o.value; } ).join( ',' );
        }
        return node.value;
    };

    function Search( cfg ) {
        var results = document.querySelector( cfg.searchresults );

        var show = function ( content ) {
            if ( !results || !content || content.SearchResult === undefined ) return;
            var html = '';
            if ( !content.SearchResult.length && cfg.noresulttemplate ) {
                html = cfg.noresulttemplate.replace( /\{+search_string+\}/, escape( content.SearchString ) );
            }
            content.SearchResult.forEach( function ( item ) {
                var date = item.published_date;
                if ( date === undefined ) {
                    var d = new Date( item.published * 1000 );
                    date = d.toLocaleString();
                }
                html += cfg.resulttemplate
                    .replace( /\{+title+\}/, escape( item.name ) )
                    .replace( /\{+date+\}/, escape( date ) )
                    .replace( /\{+class_name+\}/, escape( item.class_name ) )
                    .replace( /\{+url_alias+\}/, escape( item.url_alias ) )
                    .replace( /\{+object_id+\}/, escape( item.id ) )
                    .replace( /\{+node_id+\}/, escape( item.node_id ) );
            } );
            results.innerHTML = html;
            results.classList.remove( 'loading' );
            results.removeAttribute( 'aria-busy' );
        };

        var perform = function () {
            var text = valueOf( cfg.searchstring );
            if ( !text ) return;
            var data = new URLSearchParams();
            data.append( 'SearchStr', text );
            data.append( 'SearchLimit', valueOf( '[name=SearchLimit]' ) || '10' );
            [ 'SearchOffset', 'SearchSectionID', 'SearchDate', 'SearchContentClassAttributeID', 'SearchContentClassID',
              'SearchContentClassIdentifier', 'SearchSubTreeArray', 'SearchTimestamp' ].forEach( function ( name ) {
                var v = valueOf( '[name=' + name + ']' );
                if ( v ) data.append( name, v );
            } );
            data.append( 'EncodingFormatDate', cfg.dateformattype || 'shortdatetime' );
            ( cfg.customSearchAttributes || [] ).forEach( function ( sel ) {
                var el = document.querySelector( sel );
                if ( el ) data.append( el.getAttribute( 'name' ), el.value );
            } );
            if ( results ) { results.classList.add( 'loading' ); results.setAttribute( 'aria-busy', 'true' ); }
            window.eZFlow.io.call( cfg.backendUri || 'ezjsc::search', data ).then( show ).catch( function () {
                if ( results ) { results.classList.remove( 'loading' ); results.removeAttribute( 'aria-busy' ); }
            } );
        };

        var button = document.querySelector( cfg.searchbutton ), field = document.querySelector( cfg.searchstring );
        if ( results ) results.setAttribute( 'aria-live', 'polite' );
        if ( button ) button.addEventListener( 'click', function ( e ) { e.preventDefault(); perform(); } );
        if ( field ) field.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Enter' ) { e.preventDefault(); e.stopPropagation(); perform(); }
        } );
    }

    var ret = { version: 2, cfg: {} };
    ret.init = function () { var cfg = ret.cfg; window.eZFlow.ready( function () { Search( cfg ); } ); };
    window.eZAJAXSearch = ret;

    var keys = { searchstring: 'data-search-string', searchbutton: 'data-search-button', searchresults: 'data-search-results',
                 dateformattype: 'data-date-format', resulttemplate: 'data-result-template', noresulttemplate: 'data-noresult-template',
                 backendUri: 'data-backend-uri' };
    window.eZFlow.ready( function () {
        document.querySelectorAll( '[data-ezflow-ajaxsearch]' ).forEach( function ( box ) {
            if ( box.getAttribute( 'data-ezflow-ajaxsearch-ready' ) ) return;
            box.setAttribute( 'data-ezflow-ajaxsearch-ready', '1' );
            var cfg = {};
            Object.keys( keys ).forEach( function ( k ) { if ( box.hasAttribute( keys[k] ) ) cfg[k] = box.getAttribute( keys[k] ); } );
            if ( box.hasAttribute( 'data-custom-search-attributes' ) ) {
                try { cfg.customSearchAttributes = JSON.parse( box.getAttribute( 'data-custom-search-attributes' ) ); } catch ( e ) {}
            }
            Search( cfg );
        } );
    } );
}() );
