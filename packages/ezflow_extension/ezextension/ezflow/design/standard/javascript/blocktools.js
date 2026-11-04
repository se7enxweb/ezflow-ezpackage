/**
 * Block tools of the page datatype editor (Exponential; plain JavaScript, an ES module, needs ezflow_core.js):
 *
 * - eZFlow.BlockDD: drag and drop ordering of the items in a block's queue and online tables, stored through the
 *   ezflow/request view.
 * - eZFlow.BlockCollapse: expand / collapse of the blocks, remembered in localStorage (or in the eZPageBlockState
 *   cookie as a fallback).
 * - BlockDDInit(): drag and drop ordering of the blocks of the active zone and the move up / move down buttons,
 *   stored through ezflow::updateblockorder.
 */
( function () {
    'use strict';
    var eZFlow = window.eZFlow = window.eZFlow || {};
    if ( eZFlow.BlockDD && eZFlow.BlockDD.version === 2 ) return;

    var children = function ( parent, selector ) {
        return Array.prototype.filter.call( parent ? parent.children : [], function ( c ) { return c.matches( selector ); } );
    };

    eZFlow.BlockDD = ( function () {
        var cfg = {};

        var storeItemOrder = function ( tableBody ) {
            var data = new URLSearchParams();
            tableBody.querySelectorAll( 'td.handler' ).forEach( function ( td ) { data.append( 'Items[]', td.id ); } );
            data.append( 'Block', tableBody.parentNode.id );
            data.append( 'ContentObjectAttributeID', cfg.attributeid );
            data.append( 'Version', cfg.version );
            eZFlow.io.post( cfg.url, data ).catch( function () { /* the order is sent again with the next move */ } );
        };

        var initRow = function ( row ) {
            eZFlow.proxyDrag( row, {
                invalid: 'a',
                stopPropagation: true,
                candidates: function () {
                    return children( row.parentNode, 'tr' ).filter( function ( tr ) { return tr.querySelector( ':scope > td.handler' ); } );
                },
                start: function ( proxy ) {
                    var style = getComputedStyle( row );
                    row.style.visibility = 'hidden';
                    proxy.innerHTML = row.innerHTML;
                    Object.assign( proxy.style, { opacity: '0.67', color: style.color, backgroundColor: style.backgroundColor, border: '2px solid gray' } );
                },
                over: function ( destEl, goingUp ) {
                    if ( destEl.parentNode.parentNode.id === row.parentNode.parentNode.id ) {
                        destEl.parentNode.insertBefore( row, goingUp ? destEl : destEl.nextSibling );
                    }
                },
                end: function ( proxy ) {
                    var tableBody = row.parentNode, to = eZFlow.offset( row );
                    eZFlow.moveTo( proxy, to.left, to.top, function () {
                        proxy.remove();
                        row.style.visibility = '';
                        // clear the time left of items in rotation queue
                        tableBody.querySelectorAll( 'span.rotation-time-left' ).forEach( function ( s ) { s.textContent = ''; } );
                    } );
                    storeItemOrder( tableBody );
                }
            } );
        };

        return {
            version: 2,
            init: function () { this.initCfg(); this.initDragHandlers(); },
            initDragHandlers: function () {
                var container = document.getElementById( 'zone-tabs-container' );
                if ( !container ) return;
                container.querySelectorAll( 'table.queue td.handler, table.online td.handler' ).forEach( function ( td ) { initRow( td.parentNode ); } );
            },
            initCfg: function () { cfg = this.cfg; },
            cfg: {}
        };
    }() );

    eZFlow.BlockCollapse = ( function () {
        var Cookie = eZFlow.hasStorage ? null : eZFlow.Cookie;

        var getTriggers = function () {
            var container = document.getElementById( 'zone-tabs-container' );
            return container ? Array.prototype.slice.call( container.querySelectorAll( 'em.trigger, a.trigger, button.trigger' ) ) : [];
        };
        var getBlockContainer = function ( o ) { return o.closest( '.block-container' ); };
        var getCollapsedEl = function ( o ) { return getBlockContainer( o ).querySelector( 'div.collapsed' ); };
        var getExpandedEl = function ( o ) { return getBlockContainer( o ).querySelector( 'div.expanded' ); };
        var getBlockID = function ( o ) { return getBlockContainer( o ).id; };
        var replaceClass = function ( el, oldClass, newClass ) { el.classList.remove( oldClass ); el.classList.add( newClass ); };

        function setStorageItem( item ) {
            if ( eZFlow.hasStorage ) localStorage.setItem( 'eZPBS_' + item, '1' );
            else Cookie.setSub( 'eZPageBlockState', item, '0', '/' );
        }
        function removeStorageItem( item ) {
            if ( eZFlow.hasStorage ) localStorage.removeItem( 'eZPBS_' + item );
            else Cookie.removeSub( 'eZPageBlockState', item, '/' );
        }
        function getStorageItemState( item ) {
            if ( eZFlow.hasStorage ) return localStorage.getItem( 'eZPBS_' + item ) === null ? '0' : '1';
            if ( Cookie ) return Cookie.getSub( 'eZPageBlockState', item ) === null ? '0' : '1';
            return '0';
        }

        var expandBlock = function ( o ) {
            replaceClass( o, 'expand', 'collapse' );
            o.setAttribute( 'aria-expanded', 'true' );
            var collapsedEl = getCollapsedEl( o );
            if ( collapsedEl ) replaceClass( collapsedEl, 'collapsed', 'expanded' );
            // we save only expanded blocks
            setStorageItem( getBlockID( o ) );
        };
        var collapseBlock = function ( o ) {
            replaceClass( o, 'collapse', 'expand' );
            o.setAttribute( 'aria-expanded', 'false' );
            var expandedEl = getExpandedEl( o );
            if ( expandedEl ) replaceClass( expandedEl, 'expanded', 'collapsed' );
            removeStorageItem( getBlockID( o ) );
        };
        var updateBlockView = function ( o ) {
            if ( getStorageItemState( getBlockID( o ) ) === '1' ) expandBlock( o );
            else collapseBlock( o );
        };
        var eachBlockTrigger = function ( fn ) {
            getTriggers().forEach( function ( t ) { if ( t.nodeName.toLowerCase() === 'em' ) fn( t ); } );
        };
        var triggerAction = function ( e ) {
            var t = e.currentTarget;
            if ( t.classList.contains( 'expand' ) ) expandBlock( t );
            else if ( t.classList.contains( 'collapse' ) ) collapseBlock( t );
            else if ( t.classList.contains( 'expand-all' ) ) eachBlockTrigger( expandBlock );
            else if ( t.classList.contains( 'collapse-all' ) ) eachBlockTrigger( collapseBlock );
            e.preventDefault();
        };
        var exec = function () {
            getTriggers().forEach( function ( t ) {
                t.removeEventListener( 'click', triggerAction );
                t.addEventListener( 'click', triggerAction );
                if ( t.nodeName.toLowerCase() === 'em' ) {
                    if ( !t.hasAttribute( 'tabindex' ) ) t.setAttribute( 'tabindex', '0' );
                    t.setAttribute( 'role', 'button' );
                    updateBlockView( t );
                }
            } );
        };
        // the em triggers answer the keyboard as buttons do
        document.addEventListener( 'keydown', function ( e ) {
            var t = e.target;
            if ( ( e.key === 'Enter' || e.key === ' ' ) && t && t.matches && t.matches( '#zone-tabs-container em.trigger' ) ) {
                e.preventDefault();
                t.click();
            }
        } );

        return { init: function () { exec(); } };
    }() );

    var BlockDDInit = function () {
        var zoneSelector = '#zone-' + BlockDDInit.cfg.zone + '-blocks',
            zoneNode = document.querySelector( zoneSelector );

        var blocksOf = function () { return Array.prototype.slice.call( document.querySelectorAll( zoneSelector + ' .block-container' ) ); };

        function storeOrder( blocks ) {
            var data = new URLSearchParams();
            blocks.forEach( function ( b ) { data.append( 'block_order[]', b.id ); } );
            data.append( 'contentobject_attribute_id', BlockDDInit.cfg.attributeid );
            data.append( 'version', BlockDDInit.cfg.version );
            data.append( 'zone', BlockDDInit.cfg.zone );
            eZFlow.io.call( 'ezflow::updateblockorder', data ).catch( function () { /* stored with the form as well */ } );
        }

        function updateInputIndex( blocks ) {
            blocks.forEach( function ( block, index ) {
                block.querySelectorAll( '.block-control' ).forEach( function ( input ) {
                    var name = input.getAttribute( 'name' );
                    if ( !name ) return;
                    if ( name.match( /([a-z]+)+_([\d]+)\[([\d]+)\]\[([\d]+)\]/ ) ) {
                        name = name.replace( /([a-z]+)+_([\d]+)\[([\d]+)\]\[([\d]+)\]/, '$1_$2[$3][' + index + ']' );
                    } else if ( name.match( /([a-zA-Z+]+)\[([\d-\w_]+)-([\d]+)+(-[\w_]+)?\]/ ) ) {
                        name = name.replace( /([a-zA-Z+]+)\[([\d-\w_]+)-([\d]+)+(-[\w_]+)?\]/, '$1[$2-' + index + '$4]' );
                    } else if ( name.match( /([a-zA-Z]+)+\_+([0-9])/ ) ) {
                        name = name.replace( /([a-zA-Z]+)+\_+([0-9])/, '$1_' + index );
                    }
                    input.setAttribute( 'name', name );
                } );
            } );
        }

        if ( !zoneNode ) return;

        children( zoneNode, '.block-container' ).forEach( function ( block ) {
            eZFlow.proxyDrag( block, {
                invalid: 'textarea, input, a, button, select',
                constrain: zoneNode,
                candidates: function () { return children( block.parentNode, '.block-container' ); },
                start: function ( proxy ) {
                    var style = getComputedStyle( block ), copy = document.createElement( 'div' );
                    block.style.opacity = '.25';
                    copy.className = 'block-container';
                    copy.innerHTML = block.innerHTML;
                    proxy.appendChild( copy );
                    Object.assign( proxy.style, { border: '1px solid #808080', opacity: '.5', borderColor: style.borderTopColor, backgroundColor: style.backgroundColor } );
                },
                over: function ( drop, goingUp ) {
                    if ( drop.parentNode.id !== block.parentNode.id ) return;
                    if ( goingUp ) drop.parentNode.insertBefore( block, drop );
                    else drop.parentNode.insertBefore( block, drop.nextSibling );
                },
                end: function ( proxy ) {
                    var blocks = Array.prototype.slice.call( block.parentNode.querySelectorAll( '.block-container' ) );
                    block.style.visibility = '';
                    block.style.opacity = '1';
                    proxy.remove();
                    updateInputIndex( blocks );
                    storeOrder( blocks );
                }
            } );
        } );

        // the up and down buttons
        zoneNode.querySelectorAll( 'input[name*="_move_block"]' ).forEach( function ( button ) {
            if ( button.__ezflowMove ) button.removeEventListener( 'click', button.__ezflowMove );
            button.__ezflowMove = function ( e ) {
                var blocks = blocksOf(), movedBlock = e.currentTarget.closest( '.block-container' ),
                    goingUp = e.currentTarget.getAttribute( 'name' ).indexOf( 'move_block_up' ) !== -1,
                    i = blocks.indexOf( movedBlock ), refBlock = goingUp ? ( i > 0 ? blocks[i - 1] : null ) : blocks[i + 1];
                e.preventDefault();
                if ( i < 0 || !refBlock ) return;
                if ( goingUp ) refBlock.before( movedBlock );
                else refBlock.after( movedBlock );
                blocks = blocksOf();
                updateInputIndex( blocks );
                storeOrder( blocks );
                e.currentTarget.focus();
            };
            button.addEventListener( 'click', button.__ezflowMove );
        } );
    };
    BlockDDInit.cfg = {};
    window.BlockDDInit = BlockDDInit;
}() );
