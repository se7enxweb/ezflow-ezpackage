/*
 * ezflow: the shared base of the block editor and the site blocks, plain JavaScript (an ES module, no jQuery, no
 * inline code). It replaces what jQuery and ezjscore's jQuery io ($.ez) did for the other ezflow scripts:
 *
 *   eZFlow.ready( fn )               fn once the document is parsed
 *   eZFlow.io.call( fn, data )       an ezjscore server call (ezjscore/call, POST, the form token added), a Promise of
 *                                    the call's content; through Exponential UI's Exp.io when the page has it
 *   eZFlow.io.post( url, data )      a POST to a view (the block item order: ezflow/request), a Promise of the text
 *   eZFlow.io.get( url )             a GET of a view (the zone tabs: ezflow/zone), a Promise of the text
 *   eZFlow.proxyDrag( el, options )  pointer drag of a copy of el over candidate elements (blocks, item rows)
 *   eZFlow.moveTo( el, x, y, done )  a short eased move (none with prefers-reduced-motion)
 *   eZFlow.Cookie, eZFlow.hasStorage the block state memory, as before
 *
 * The address of ezjscore/call comes from an element with data-ezflow-call (the templates print one), else from
 * Exponential UI's configuration, else the site root. Set up once, however often it is loaded.
 */
( function () {
    'use strict';
    var eZFlow = window.eZFlow = window.eZFlow || {};
    if ( eZFlow.core ) return;
    eZFlow.core = { version: 2 };

    var reduced = window.matchMedia ? window.matchMedia( '(prefers-reduced-motion: reduce)' ) : { matches: false };

    eZFlow.ready = function ( fn ) {
        if ( document.readyState === 'loading' ) document.addEventListener( 'DOMContentLoaded', fn, { once: true } );
        else fn();
    };

    function token() {
        var el = document.getElementById( 'ezxform_token_js' );
        return el ? ( el.getAttribute( 'title' ) || '' ) : '';
    }

    function callUrl() {
        var el = document.querySelector( '[data-ezflow-call]' );
        if ( el ) return el.getAttribute( 'data-ezflow-call' );
        if ( window.Exp && window.Exp.config && window.Exp.config.call ) return window.Exp.config.call;
        return '/ezjscore/call/';
    }

    function encode( data ) {
        if ( data instanceof URLSearchParams ) return data;
        if ( typeof data === 'string' ) return new URLSearchParams( data );
        var params = new URLSearchParams();
        Object.keys( data || {} ).forEach( function ( key ) {
            var value = data[key];
            if ( Array.isArray( value ) ) value.forEach( function ( v ) { params.append( key + '[]', v ); } );
            else if ( value !== undefined && value !== null ) params.append( key, value );
        } );
        return params;
    }

    function request( url, method, body ) {
        return fetch( url, {
            method: method, body: body, credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json,text/html,*/*' }
        } ).then( function ( response ) {
            if ( !response.ok ) throw new Error( 'HTTP ' + response.status );
            return response.text();
        } );
    }

    eZFlow.io = {
        token: token,
        call: function ( fn, data ) {
            if ( window.Exp && window.Exp.io && window.Exp.io.call ) {
                return Promise.resolve( window.Exp.io.call( fn, data ) );
            }
            var body = encode( data );
            body.set( 'ezjscServer_function_arguments', fn );
            if ( token() && !body.has( 'ezxform_token' ) ) body.set( 'ezxform_token', token() );
            return request( callUrl().replace( /\/$/, '' ), 'POST', body ).then( function ( text ) {
                var json = JSON.parse( text );
                if ( json && json.error_text ) throw new Error( json.error_text );
                return json ? json.content : null;
            } );
        },
        post: function ( url, data ) {
            var body = encode( data );
            if ( token() && !body.has( 'ezxform_token' ) ) body.set( 'ezxform_token', token() );
            return request( url, 'POST', body );
        },
        get: function ( url ) { return request( url, 'GET' ); }
    };

    eZFlow.offset = function ( el ) {
        var r = el.getBoundingClientRect();
        return { left: r.left + window.pageXOffset, top: r.top + window.pageYOffset };
    };

    eZFlow.moveTo = function ( el, left, top, done ) {
        if ( reduced.matches || !el.animate ) {
            el.style.left = left + 'px';
            el.style.top = top + 'px';
            if ( done ) done();
            return;
        }
        var a = el.animate( [ { left: el.style.left, top: el.style.top }, { left: left + 'px', top: top + 'px' } ],
                            { duration: 200, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' } );
        a.onfinish = function () { if ( done ) done(); };
    };

    /**
     * Proxy drag: drags a copy (the proxy) of an element with the pointer while the element stays in the document,
     * and reports which of the candidate elements the pointer is over, together with the vertical direction.
     * options: invalid (selector of children that never start a drag), stopPropagation, constrain (element the proxy
     * stays inside), candidates() (the drop elements), start( proxy ), over( target, goingUp ), end( proxy ).
     * A press held for a second starts the drag without moving.
     */
    eZFlow.proxyDrag = function ( el, options ) {
        if ( el.__ezflowDrag ) el.removeEventListener( 'pointerdown', el.__ezflowDrag );
        var onDown = function ( e ) {
            if ( e.pointerType === 'mouse' && e.button !== 0 ) return;
            if ( options.invalid && e.target.closest( options.invalid ) && el.contains( e.target.closest( options.invalid ) ) ) return;
            if ( !e.target.matches( 'input, select, textarea, option, button' ) ) e.preventDefault();
            if ( options.stopPropagation ) e.stopPropagation();

            var startX = e.pageX, startY = e.pageY, pageX = startX, pageY = startY, lastY = startY, goingUp = false,
                dragging = false, proxy = null, offsetX = 0, offsetY = 0, timer = null;

            var moveProxy = function () {
                var left = pageX - offsetX, top = pageY - offsetY;
                if ( options.constrain ) {
                    var c = typeof options.constrain === 'string' ? document.querySelector( options.constrain ) : options.constrain;
                    if ( c ) {
                        var co = eZFlow.offset( c );
                        left = Math.max( co.left, Math.min( left, co.left + c.offsetWidth - proxy.offsetWidth ) );
                        top = Math.max( co.top, Math.min( top, co.top + c.offsetHeight - proxy.offsetHeight ) );
                    }
                }
                proxy.style.left = left + 'px';
                proxy.style.top = top + 'px';
            };
            var startDrag = function () {
                if ( dragging ) return;
                dragging = true;
                clearTimeout( timer );
                var o = eZFlow.offset( el );
                offsetX = startX - o.left;
                offsetY = startY - o.top;
                proxy = document.createElement( 'div' );
                proxy.className = 'ezflow-drag-proxy';
                Object.assign( proxy.style, {
                    position: 'absolute', zIndex: '999', boxSizing: 'border-box', overflow: 'hidden', cursor: 'move',
                    pointerEvents: 'none', left: o.left + 'px', top: o.top + 'px',
                    width: el.offsetWidth + 'px', height: el.offsetHeight + 'px'
                } );
                document.body.appendChild( proxy );
                options.start( proxy );
                moveProxy();
            };
            var onMove = function ( ev ) {
                pageX = ev.pageX;
                pageY = ev.pageY;
                if ( !dragging ) {
                    if ( Math.abs( pageX - startX ) > 3 || Math.abs( pageY - startY ) > 3 ) startDrag();
                    else return;
                }
                moveProxy();
                if ( pageY < lastY ) goingUp = true;
                else if ( pageY > lastY ) goingUp = false;
                lastY = pageY;
                var candidates = options.candidates();
                for ( var i = 0; i < candidates.length; i++ ) {
                    var target = candidates[i];
                    if ( target === el ) continue;
                    var r = target.getBoundingClientRect(), x = pageX - window.pageXOffset, y = pageY - window.pageYOffset;
                    if ( x >= r.left && x <= r.right && y >= r.top && y <= r.bottom ) {
                        options.over( target, goingUp );
                        break;
                    }
                }
            };
            var onUp = function () {
                clearTimeout( timer );
                document.removeEventListener( 'pointermove', onMove );
                document.removeEventListener( 'pointerup', onUp );
                document.removeEventListener( 'pointercancel', onUp );
                if ( dragging ) options.end( proxy );
            };
            timer = setTimeout( startDrag, 1000 );
            document.addEventListener( 'pointermove', onMove );
            document.addEventListener( 'pointerup', onUp );
            document.addEventListener( 'pointercancel', onUp );
        };
        el.__ezflowDrag = onDown;
        el.addEventListener( 'pointerdown', onDown );
    };

    // function taken from the modernizr library
    eZFlow.hasStorage = ( function () {
        var mod = '_ez_ls_check';
        try { localStorage.setItem( mod, mod ); localStorage.removeItem( mod ); return true; } catch ( e ) { return false; }
    }() );

    // Sub value cookie ( name=sub1=value1&sub2=value2 ), used when localStorage is not available
    eZFlow.Cookie = {
        getSubs: function ( name ) {
            var parts = document.cookie ? document.cookie.split( /;\s*/ ) : [], subs = {}, i, j, pair, value;
            for ( i = 0; i < parts.length; i++ ) {
                if ( parts[i].indexOf( name + '=' ) === 0 ) {
                    value = parts[i].substring( name.length + 1 );
                    if ( value === '' ) return subs;
                    pair = value.split( '&' );
                    for ( j = 0; j < pair.length; j++ ) {
                        var kv = pair[j].split( '=' );
                        subs[ decodeURIComponent( kv[0] ) ] = decodeURIComponent( kv.slice( 1 ).join( '=' ) );
                    }
                    return subs;
                }
            }
            return null;
        },
        setSubs: function ( name, subs, path ) {
            var list = [];
            Object.keys( subs ).forEach( function ( key ) { list.push( encodeURIComponent( key ) + '=' + encodeURIComponent( subs[key] ) ); } );
            document.cookie = name + '=' + list.join( '&' ) + '; path=' + ( path || '/' ) + '; SameSite=Lax';
        },
        getSub: function ( name, sub ) {
            var subs = this.getSubs( name );
            return ( subs && Object.prototype.hasOwnProperty.call( subs, sub ) ) ? subs[sub] : null;
        },
        setSub: function ( name, sub, value, path ) {
            var subs = this.getSubs( name ) || {};
            subs[sub] = value;
            this.setSubs( name, subs, path );
        },
        removeSub: function ( name, sub, path ) {
            var subs = this.getSubs( name ) || {};
            delete subs[sub];
            this.setSubs( name, subs, path );
        },
        get: function ( name ) {
            var parts = document.cookie ? document.cookie.split( /;\s*/ ) : [];
            for ( var i = 0; i < parts.length; i++ ) {
                if ( parts[i].indexOf( name + '=' ) === 0 ) return decodeURIComponent( parts[i].substring( name.length + 1 ) );
            }
            return null;
        },
        set: function ( name, value, path ) {
            document.cookie = name + '=' + encodeURIComponent( value ) + '; path=' + ( path || '/' ) + '; SameSite=Lax';
        }
    };
}() );
