/*
 * ezflow: the site blocks and views of the ezflow and iphone designs without inline code, so they work under a
 * Content Security Policy without 'unsafe-inline'. Each starts from the data attributes of its markup:
 *
 *   data-ezflow-carousel="<block id>" data-total="<n>"   the multimedia carousel (block/multimediacarousel.tpl): its
 *                                                        previous/next buttons load three items at a time through
 *                                                        ezjscore (ezflow::getvaliditems)
 *   data-ezflow-online-users="<block id>"                the online users block (block/online_users.tpl): the count
 *                                                        is refreshed through ezjscore (ezflow::onlineusers)
 *   data-ezflow-gmap-location="<address>"                the map block (block/gmap.tpl): the map is centered on the
 *                                                        address (Google Maps geocoder)
 *   data-ezflow-select-on-click                          the embed code field (parts/flash_player.tpl): a click
 *                                                        selects its text
 *   data-ezflow-nav-toggle="<menu id>"                   the iphone design's menu button (pagelayout.tpl): slides
 *                                                        the menu open
 *
 * Plain JavaScript (an ES module), the server calls through ezflow_core.js. Set up once, however often it is printed.
 */
( function()
{
    if ( window.eZFlowBlocks ) return;
    window.eZFlowBlocks = { 'version': 1 };

    function each( selector, fn )
    {
        var list = document.querySelectorAll( selector );
        for ( var i = 0; i < list.length; i++ )
        {
            if ( list[i].getAttribute( 'data-ezflow-ready' ) ) continue;
            list[i].setAttribute( 'data-ezflow-ready', '1' );
            fn( list[i] );
        }
    }

    function carousel( box )
    {
        var blockId = box.getAttribute( 'data-ezflow-carousel' ),
            offset = 0,
            limit = 3,
            total = parseInt( box.getAttribute( 'data-total' ), 10 ) || 0;

        var show = function( content )
        {
            if ( !content ) return;
            box.querySelectorAll( '.col-content' ).forEach( function( col, i )
            {
                col.classList.remove( 'loading' );
                col.style.height = '';
                if ( content[i] !== undefined ) col.innerHTML = content[i];
            } );
        };

        var handleRequest = function( e )
        {
            var className = e.currentTarget.className;
            if ( className.indexOf( 'carousel-next-button' ) !== -1 )
            {
                offset += 3;
                if ( offset > total ) offset = 0;
            }
            if ( className.indexOf( 'carousel-prev-button' ) !== -1 )
            {
                offset = offset == 0 ? Math.floor( total / 3 ) * 3 : offset - 3;
            }
            box.querySelectorAll( '.col-content' ).forEach( function( col )
            {
                col.classList.add( 'loading' );
                col.style.height = col.getBoundingClientRect().height + 'px';
                col.replaceChildren();
            } );
            window.eZFlow.io.call( 'ezflow::getvaliditems', { http_accept: 'json', offset: offset, limit: limit, block_id: blockId } )
                .then( show ).catch( function() { show( [] ); } );
        };

        var prev = box.querySelector( 'input.carousel-prev-button' ), next = box.querySelector( 'input.carousel-next-button' );
        if ( prev ) { prev.setAttribute( 'aria-label', 'Previous' ); prev.addEventListener( 'click', handleRequest ); }
        if ( next ) { next.setAttribute( 'aria-label', 'Next' ); next.addEventListener( 'click', handleRequest ); }
    }

    function onlineUsers( box )
    {
        var blockId = box.getAttribute( 'data-ezflow-online-users' );
        window.eZFlow.io.call( 'ezflow::onlineusers' ).then( function( content )
        {
            var el = document.getElementById( 'logged-in-count-' + blockId );
            if ( el && content && content.logged_in_count !== undefined ) el.textContent = content.logged_in_count;
        } ).catch( function() {} );
    }

    function gmap( container )
    {
        if ( !window.google || !google.maps ) return;
        var map = new google.maps.Map( container, {
            zoom: 12,
            center: new google.maps.LatLng( -34.397, 150.644 ),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        } );
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': container.getAttribute( 'data-ezflow-gmap-location' ) }, function( results, status )
        {
            if ( status == google.maps.GeocoderStatus.OK )
            {
                map.setCenter( results[0].geometry.location );
                new google.maps.Marker( { map: map, position: results[0].geometry.location } );
            }
            else
            {
                window.console && console.warn( "Geocode was not successful for the following reason: " + status );
            }
        } );
    }

    function navToggle( handler )
    {
        handler.addEventListener( 'click', function()
        {
            var node = document.getElementById( handler.getAttribute( 'data-ezflow-nav-toggle' ) ),
                duration = 1000, start = null, to;
            if ( !node ) return;

            node.style.display = 'block';
            node.style.height = '0px';
            to = node.scrollHeight;

            // slide open from 0 to the full height, quadratic ease out
            var step = function( now )
            {
                if ( start === null )
                {
                    start = now;
                }
                var t = Math.min( 1, ( now - start ) / duration );
                node.style.height = ( to * ( 1 - ( 1 - t ) * ( 1 - t ) ) ) + 'px';
                if ( t < 1 )
                {
                    window.requestAnimationFrame( step );
                }
                else
                {
                    node.classList.add( 'nav-menu-expanded' );
                }
            };
            window.requestAnimationFrame( step );
        } );
    }

    document.addEventListener( 'click', function( e )
    {
        var field = e.target;
        if ( field && field.hasAttribute && field.hasAttribute( 'data-ezflow-select-on-click' ) )
        {
            field.focus();
            field.select();
        }
    } );

    function start()
    {
        each( '[data-ezflow-nav-toggle]', navToggle );
        each( '[data-ezflow-carousel]', carousel );
        if ( window.eZFlow && window.eZFlow.io ) each( '[data-ezflow-online-users]', onlineUsers );
        each( '[data-ezflow-gmap-location]', gmap );
    }

    if ( document.readyState === 'loading' )
        document.addEventListener( 'DOMContentLoaded', start );
    else
        start();
} )();
