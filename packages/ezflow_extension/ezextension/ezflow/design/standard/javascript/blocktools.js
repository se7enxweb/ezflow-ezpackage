/**
 * Block tools of the page datatype editor (Exponential, jQuery):
 *
 * - eZFlow.BlockDD: drag and drop ordering of the items in a block's queue
 *   and online tables, stored through the ezflow/request view.
 * - eZFlow.BlockCollapse: expand / collapse of the blocks, remembered in
 *   localStorage (or in the eZPageBlockState cookie as a fallback).
 * - BlockDDInit(): drag and drop ordering of the blocks of the active zone and
 *   the move up / move down buttons, stored through ezflow::updateblockorder.
 */

var eZFlow = window.eZFlow || {};
window.eZFlow = eZFlow;

(function( $ ) {

    if ( $.easing.ezflowEaseOut === undefined ) {
        // quadratic ease out
        $.easing.ezflowEaseOut = function( p ) {
            return 1 - ( 1 - p ) * ( 1 - p );
        };
    }

    /**
     * Proxy drag: drags a copy (the proxy) of an element with the pointer while
     * the element stays in the document, and reports which of the candidate
     * elements the pointer is over, together with the vertical direction.
     *
     * options: invalid (selector of children that never start a drag),
     *          stopPropagation (true: a drag started here never reaches the
     *          parents' drags), constrain (element the proxy stays inside), candidates (function
     *          returning the drop elements), start( proxy ), over( target, goingUp ),
     *          end( proxy ).
     */
    eZFlow.proxyDrag = function( el, options ) {
        var $el = $( el ), ns = '.ezflowdrag';

        $el.off( 'pointerdown' + ns ).on( 'pointerdown' + ns, function( e ) {
            if ( e.pointerType === 'mouse' && e.button !== 0 ) {
                return;
            }
            if ( options.invalid && $( e.target ).closest( options.invalid, el ).length ) {
                return;
            }
            if ( !$( e.target ).is( 'input, select, textarea, option, button' ) ) {
                e.preventDefault();
            }
            if ( options.stopPropagation ) {
                // an item row being dragged does not drag its block as well
                e.stopPropagation();
            }

            var startX = e.pageX, startY = e.pageY,
                pageX = startX, pageY = startY,
                lastY = startY, goingUp = false,
                dragging = false, proxy = null, offsetX = 0, offsetY = 0,
                timer = null;

            var moveProxy = function() {
                var left = pageX - offsetX, top = pageY - offsetY;

                if ( options.constrain ) {
                    var $c = $( options.constrain ), co = $c.offset();
                    if ( co ) {
                        left = Math.max( co.left, Math.min( left, co.left + $c.outerWidth() - proxy.offsetWidth ) );
                        top = Math.max( co.top, Math.min( top, co.top + $c.outerHeight() - proxy.offsetHeight ) );
                    }
                }
                proxy.style.left = left + 'px';
                proxy.style.top = top + 'px';
            };

            var startDrag = function() {
                if ( dragging ) {
                    return;
                }
                dragging = true;
                clearTimeout( timer );

                var o = $el.offset();
                offsetX = startX - o.left;
                offsetY = startY - o.top;

                proxy = document.createElement( 'div' );
                proxy.className = 'ezflow-drag-proxy';
                $( proxy ).css( {
                    position: 'absolute',
                    zIndex: 999,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    cursor: 'move',
                    pointerEvents: 'none',
                    left: o.left + 'px',
                    top: o.top + 'px',
                    width: el.offsetWidth + 'px',
                    height: el.offsetHeight + 'px'
                } );
                document.body.appendChild( proxy );
                options.start( proxy );
                moveProxy();
            };

            var onMove = function( ev ) {
                pageX = ev.pageX;
                pageY = ev.pageY;

                if ( !dragging ) {
                    if ( Math.abs( pageX - startX ) > 3 || Math.abs( pageY - startY ) > 3 ) {
                        startDrag();
                    } else {
                        return;
                    }
                }

                moveProxy();

                if ( pageY < lastY ) {
                    goingUp = true;
                } else if ( pageY > lastY ) {
                    goingUp = false;
                }
                lastY = pageY;

                var candidates = options.candidates();
                for ( var i = 0; i < candidates.length; i++ ) {
                    var target = candidates[i];
                    if ( target === el ) {
                        continue;
                    }
                    var r = target.getBoundingClientRect(),
                        x = pageX - window.pageXOffset,
                        y = pageY - window.pageYOffset;
                    if ( x >= r.left && x <= r.right && y >= r.top && y <= r.bottom ) {
                        options.over( target, goingUp );
                        break;
                    }
                }
            };

            var onUp = function() {
                clearTimeout( timer );
                $( document ).off( ns );
                if ( dragging ) {
                    options.end( proxy );
                }
            };

            // a press held for a second starts the drag without moving
            timer = setTimeout( function() {
                startDrag();
            }, 1000 );

            $( document )
                .on( 'pointermove' + ns, onMove )
                .on( 'pointerup' + ns + ' pointercancel' + ns, onUp );
        } );
    };

    eZFlow.BlockDD = function() {

        var cfg = {};

        var storeItemOrder = function( tableBody ) {
            var postData = "",
                _tokenNode = document.getElementById('ezxform_token_js');
            if ( _tokenNode ) {
                postData = 'ezxform_token=' + _tokenNode.getAttribute('title') + '&';
            }
            var items = $( tableBody ).find( 'td.handler' );

            for (var i = 0; i < items.length; i++) {
                postData += "Items%5B%5D=" + items[i].id + "&";
            }

            var tableID = tableBody.parentNode.id;

            postData += "Block=" + tableID + "&ContentObjectAttributeID=" + cfg.attributeid + "&Version=" + cfg.version;

            $.ajax( { type: 'POST', url: cfg.url, data: postData } );
        };

        var initRow = function( row ) {
            eZFlow.proxyDrag( row, {
                invalid: 'a',
                stopPropagation: true,
                candidates: function() {
                    return $( row.parentNode ).children( 'tr' ).filter( function() {
                        return $( this ).children( 'td.handler' ).length > 0;
                    } ).get();
                },
                start: function( proxy ) {
                    $( row ).css( 'visibility', 'hidden' );
                    proxy.innerHTML = row.innerHTML;
                    $( proxy ).css( {
                        opacity: 0.67,
                        color: $( row ).css( 'color' ),
                        backgroundColor: $( row ).css( 'background-color' ),
                        border: '2px solid gray'
                    } );
                },
                over: function( destEl, goingUp ) {
                    if ( destEl.parentNode.parentNode.id === row.parentNode.parentNode.id ) {
                        var p = destEl.parentNode;
                        if ( goingUp ) {
                            p.insertBefore( row, destEl );
                        } else {
                            p.insertBefore( row, destEl.nextSibling );
                        }
                    }
                },
                end: function( proxy ) {
                    var tableBody = row.parentNode,
                        to = $( row ).offset();

                    $( proxy ).animate( { left: to.left, top: to.top }, 200, 'ezflowEaseOut', function() {
                        $( proxy ).remove();
                        $( row ).css( 'visibility', '' );
                        // clear the time left of items in rotation queue
                        $( tableBody ).find( 'span.rotation-time-left' ).html( '' );
                    } );

                    storeItemOrder( tableBody );
                }
            } );
        };

        return {

            init: function() {
                this.initCfg();
                this.initDragHandlers();
            },

            initDragHandlers: function() {
                $( '#zone-tabs-container' ).find( 'table.queue, table.online' ).each( function() {
                    $( this ).find( 'td.handler' ).each( function() {
                        initRow( this.parentNode );
                    } );
                } );
            },

            initCfg: function() {
                cfg = this.cfg;
            },

            cfg: {}
        };

    }();

    // function taken from the modernizr library
    eZFlow.hasStorage = (function() {
        var mod = '_ez_ls_check';

        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    }());

    // Sub value cookie ( name=sub1=value1&sub2=value2 ), used when localStorage is not available
    eZFlow.Cookie = {
        getSubs: function( name ) {
            var parts = document.cookie ? document.cookie.split( /;\s*/ ) : [], subs = {}, i, j, pair, value;

            for ( i = 0; i < parts.length; i++ ) {
                if ( parts[i].indexOf( name + '=' ) === 0 ) {
                    value = parts[i].substring( name.length + 1 );
                    if ( value === '' ) {
                        return subs;
                    }
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
        setSubs: function( name, subs, path ) {
            var list = [], key;
            for ( key in subs ) {
                if ( Object.prototype.hasOwnProperty.call( subs, key ) ) {
                    list.push( encodeURIComponent( key ) + '=' + encodeURIComponent( subs[key] ) );
                }
            }
            document.cookie = name + '=' + list.join( '&' ) + '; path=' + ( path || '/' );
        },
        getSub: function( name, sub ) {
            var subs = this.getSubs( name );
            return ( subs && Object.prototype.hasOwnProperty.call( subs, sub ) ) ? subs[sub] : null;
        },
        setSub: function( name, sub, value, path ) {
            var subs = this.getSubs( name ) || {};
            subs[sub] = value;
            this.setSubs( name, subs, path );
        },
        removeSub: function( name, sub, path ) {
            var subs = this.getSubs( name ) || {};
            delete subs[sub];
            this.setSubs( name, subs, path );
        },
        get: function( name ) {
            var parts = document.cookie ? document.cookie.split( /;\s*/ ) : [], i;
            for ( i = 0; i < parts.length; i++ ) {
                if ( parts[i].indexOf( name + '=' ) === 0 ) {
                    return decodeURIComponent( parts[i].substring( name.length + 1 ) );
                }
            }
            return null;
        },
        set: function( name, value, path ) {
            document.cookie = name + '=' + encodeURIComponent( value ) + '; path=' + ( path || '/' );
        }
    };

    eZFlow.BlockCollapse = function(){
        var Cookie;

        if ( !eZFlow.hasStorage )
        {
            Cookie = eZFlow.Cookie;
        }

        var getTriggers = function() {
            var container = $( '#zone-tabs-container' );
            var emTriggers = container.find( 'em.trigger' ).get();
            var aTriggers = container.find( 'a.trigger' ).get();
            var buttonTriggers = container.find( 'button.trigger' ).get();

            return emTriggers.concat(aTriggers).concat(buttonTriggers);
        };

        var exec = function() {
            var triggers = getTriggers();

            for( var i = 0; i < triggers.length; i++ ) {
                var triggerEl = triggers[i];

                setTriggerEvent(triggerEl);

                if(triggerEl.nodeName.toLowerCase() === "em") {
                    updateBlockView(triggerEl);
                }
            }
        };

        var setTriggerEvent = function(o) {
            $( o ).off( 'click.ezflowcollapse' ).on( 'click.ezflowcollapse', function( e ) {
                triggerAction( e, o );
            } );
        };

        var getBlockContainer = function(o) {
            return $( o ).closest( '.block-container' )[0];
        };

        var getCollapsedEl = function(o) {
            return $( getBlockContainer(o) ).find( 'div.collapsed' )[0];
        };

        var getExpandedEl = function(o) {
            return $( getBlockContainer(o) ).find( 'div.expanded' )[0];
        };

        var getBlockID = function(o) {
            return getBlockContainer(o).id;
        };

        var replaceClass = function( el, oldClass, newClass ) {
            $( el ).removeClass( oldClass ).addClass( newClass );
        };

        function setStorageItem(item) {

            if( eZFlow.hasStorage ){
                localStorage.setItem( "eZPBS_" + item, "1" );
            }
            else{
                Cookie.setSub("eZPageBlockState", item, "0", "/");
            }
        }

        function removeStorageItem(item) {

            if( eZFlow.hasStorage ){
                localStorage.removeItem( "eZPBS_" + item );
            }
            else{
                Cookie.removeSub("eZPageBlockState", item, "/");
            }
        }

        function getStorageItemState(item) {

            if( eZFlow.hasStorage ){
                return ( localStorage.getItem( "eZPBS_" + item ) === null )? "0" : "1";
            }
            else if (Cookie){
                return (Cookie.getSub("eZPageBlockState", item) === null)? "0" : "1";
            }
            else{
                return "0";
            }
        }

        var expandBlock = function(o) {
            replaceClass( o, "expand", "collapse" );

            var collapsedEl = getCollapsedEl(o);

            if(collapsedEl) {
                replaceClass( collapsedEl, "collapsed", "expanded" );
            }

            // we save only expanded blocks
            setStorageItem(getBlockID(o));
        };

        var collapseBlock = function(o) {
            replaceClass( o, "collapse", "expand" );

            var expandedEl = getExpandedEl(o);

            if(expandedEl) {
                replaceClass( expandedEl, "expanded", "collapsed" );
            }

            removeStorageItem(getBlockID(o));
        };

        var updateBlockView = function(o) {
            var state = getStorageItemState(getBlockID(o));

            if(state == "1")
            {
                expandBlock(o);
            }
            else
            {
                collapseBlock(o);
            }
        };

        var expandAll = function() {
            var triggers = getTriggers();

            for( var i = 0; i < triggers.length; i++ ) {
                var triggerEl = triggers[i];

                if(triggerEl.nodeName.toLowerCase() == "em") {
                    expandBlock(triggerEl);
                }
            }
        };

        var collapseAll = function() {
            var triggers = getTriggers();

            for( var i = 0; i < triggers.length; i++ ) {
                var triggerEl = triggers[i];

                if(triggerEl.nodeName.toLowerCase() == "em") {
                    collapseBlock(triggerEl);
                }
            }
        };

        var triggerAction = function(e, triggerEl) {
            var $t = $( triggerEl );

            if( $t.hasClass( "expand" ) ) {
                expandBlock(triggerEl);
            }
            else if( $t.hasClass( "collapse" ) ) {
                collapseBlock(triggerEl);
            }
            else if( $t.hasClass( "expand-all" ) ) {
                expandAll();
            }
            else if( $t.hasClass( "collapse-all" ) ) {
                collapseAll();
            }
            e.preventDefault();
        };

        return {
            init: function() {
                exec();
            }
        };
    }();

})( jQuery );

var BlockDDInit = function() {
    var $ = jQuery,
        zoneSelector = '#zone-' + BlockDDInit.cfg.zone + '-blocks',
        zoneNode = $( zoneSelector )[0];

    function storeOrder(blocks) {
        var data = '';

        blocks.each(function() {
            data += 'block_order%5B%5D=' + this.id;
            data += '&';
        });

        data += 'contentobject_attribute_id=' + BlockDDInit.cfg.attributeid;
        data += '&version=' + BlockDDInit.cfg.version;
        data += '&zone=' + BlockDDInit.cfg.zone;
        $.ez( 'ezflow::updateblockorder', data, _callBack );
    }

    function updateInputIndex(blocks) {
        var index = 0;

        blocks.each(function() {
            $( this ).find( '.block-control' ).each( function() {
                var input = this,
                    name = input.getAttribute( 'name' );

                if ( !name ) {
                    return;
                }

                if( name.match(/([a-z]+)+_([\d]+)\[([\d]+)\]\[([\d]+)\]/) ) {
                    name = name.replace( /([a-z]+)+_([\d]+)\[([\d]+)\]\[([\d]+)\]/, "$1_$2[$3][" + index + "]" );
                } else if ( name.match(/([a-zA-Z+]+)\[([\d-\w_]+)-([\d]+)+(-[\w_]+)?\]/) ) {
                    name = name.replace( /([a-zA-Z+]+)\[([\d-\w_]+)-([\d]+)+(-[\w_]+)?\]/, "$1[$2-" + index + "$4]" );
                } else if ( name.match(/([a-zA-Z]+)+\_+([0-9])/) ) {
                    name = name.replace( /([a-zA-Z]+)+\_+([0-9])/, "$1_" + index );
                }

                input.setAttribute( 'name', name );
            } );

            index++;
        });
    }

    function _callBack() {

    }

    if ( !zoneNode ) {
        return;
    }

    $( zoneNode ).children( '.block-container' ).each( function() {
        var block = this;

        eZFlow.proxyDrag( block, {
            invalid: 'textarea, input, a, button, select',
            constrain: zoneNode,
            candidates: function() {
                return $( block.parentNode ).children( '.block-container' ).get();
            },
            start: function( proxy ) {
                $( block ).css( 'opacity', '.25' );
                $( '<div></div>' ).addClass( 'block-container' ).html( block.innerHTML ).appendTo( proxy );
                $( proxy ).css( {
                    border: '1px solid #808080',
                    opacity: '.5',
                    borderColor: $( block ).css( 'border-top-color' ),
                    backgroundColor: $( block ).css( 'background-color' )
                } );
            },
            over: function( drop, goingUp ) {
                if ( drop.parentNode.id === block.parentNode.id ) {
                    if ( !goingUp ) {
                        var dropSibling = drop.nextSibling;
                        if ( !dropSibling ) {
                            drop.parentNode.appendChild( block );
                        } else {
                            drop.parentNode.insertBefore( block, dropSibling );
                        }
                    } else {
                        drop.parentNode.insertBefore( block, drop );
                    }
                }
            },
            end: function( proxy ) {
                var blocks = $( block.parentNode ).find( '.block-container' );

                $( block ).css( { visibility: '', opacity: '1' } );
                $( proxy ).remove();

                updateInputIndex(blocks);
                storeOrder(blocks);
            }
        } );
    } );

    // configuring the up and down button
    $( zoneNode ).find( 'input[name*="_move_block"]' ).off( 'click.ezflowmove' ).on( 'click.ezflowmove', function (e) {
        var blocks = $( zoneSelector + ' .block-container' ),
            movedBlock = $( e.currentTarget ).closest( '.block-container' )[0],
            goingUp = ( e.currentTarget.getAttribute( 'name' ).indexOf( 'move_block_up' ) !== -1 );

        e.preventDefault();
        blocks.each( function( i ) {
            var refBlock;

            if ( this.id === movedBlock.id ) {
                if ( goingUp ) {
                    refBlock = i > 0 ? blocks[i - 1] : null;
                } else {
                    refBlock = blocks[i + 1];
                }
                if ( refBlock ) {
                    if ( goingUp ) {
                        $( refBlock ).before( movedBlock );
                    } else {
                        $( refBlock ).after( movedBlock );
                    }
                    blocks = $( zoneSelector + ' .block-container' );
                    updateInputIndex(blocks);
                    storeOrder(blocks);
                }
                return false;
            }
        } );
    });
};
BlockDDInit.cfg = {};
