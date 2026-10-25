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
 * jQuery (ezjsc::jquery, ezjsc::jqueryio) where the old code used it. Set up once, however often it is printed.
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

    function carousel( $, box )
    {
        var blockId = box.getAttribute( 'data-ezflow-carousel' ),
            offset = 0,
            limit = 3,
            total = parseInt( box.getAttribute( 'data-total' ), 10 ) || 0;

        var callBack = function( response )
        {
            if ( response !== undefined && response !== null )
            {
                var colContent = $( box ).find( '.col-content' );

                for ( var i = 0; i < colContent.length; i++ )
                {
                    var colNode = colContent.eq( i );
                    if ( response.content[i] !== undefined )
                        colNode.html( response.content[i] );
                }
            }
        };

        var handleRequest = function( e )
        {
            var className = e.target.className;
            if ( className == 'carousel-next-button' )
            {
                offset += 3;

                if ( offset > total )
                    offset = 0;
            }

            if ( className == 'carousel-prev-button' )
            {
                if ( offset == 0 )
                    offset = Math.floor( total / 3 ) * 3;
                else
                    offset -= 3;
            }

            $( box ).find( '.col-content' ).each( function()
            {
                var n = $( this );
                n.addClass( 'loading' );
                var height = this.getBoundingClientRect().bottom - this.getBoundingClientRect().top;
                n.css( 'height', height + 'px' );
                n.html( '' );
            } );

            var data = 'http_accept=json&offset=' + offset;
            data += '&limit=' + limit;
            data += '&block_id=' + encodeURIComponent( blockId );

            $.ez( 'ezflow::getvaliditems', data, callBack );
        };

        $( box ).find( 'input.carousel-prev-button' ).first().on( 'click', handleRequest );
        $( box ).find( 'input.carousel-next-button' ).first().on( 'click', handleRequest );
    }

    function onlineUsers( $, box )
    {
        var blockId = box.getAttribute( 'data-ezflow-online-users' );
        $.ez( 'ezflow::onlineusers', false, function( response )
        {
            if ( response !== undefined && response !== null && response.content !== undefined )
            {
                $( document.getElementById( 'logged-in-count-' + blockId ) ).html( response.content.logged_in_count );
            }
        } );
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
                alert( "Geocode was not successful for the following reason: " + status );
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
        if ( window.jQuery )
        {
            jQuery( function( $ )
            {
                each( '[data-ezflow-carousel]', function( box ) { carousel( $, box ); } );
                if ( $.ez ) each( '[data-ezflow-online-users]', function( box ) { onlineUsers( $, box ); } );
                each( '[data-ezflow-gmap-location]', gmap );
            } );
        }
    }

    if ( document.readyState === 'loading' )
        document.addEventListener( 'DOMContentLoaded', start );
    else
        start();
} )();
