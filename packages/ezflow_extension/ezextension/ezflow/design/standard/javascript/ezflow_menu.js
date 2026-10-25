/*
 * ezflow: the "Exponential Flow" entries of the content tree's context menus (node/ezflcontextmenu.tpl,
 * node/ezflsubitemscontextmenu.tpl) and their submenu (node/ezflcontextsubmenu.tpl), without inline code, so they
 * work under a Content Security Policy without 'unsafe-inline'.
 *
 *   <div class="popupmenu" id="eZFlow" data-ezflow-menu-depth="1">       the submenu: menuArray['eZFlow'] with its depth
 *   <a id="push-to-block" data-ezflow-menu="eZFlow" data-ezflow-menu-url="/ezflow/push/%nodeID%">
 *                                                                       an entry: menuArray['eZFlow']['elements'][id]['url'];
 *                                                                       pointing at it calls ezpopmenu_mouseOver('eZFlow')
 *   <a id="menu-ezflow" data-ezflow-submenu="eZFlow">                   the item that opens the submenu:
 *                                                                       ezpopmenu_showSubLevel( event, 'eZFlow', id )
 *
 * menuArray is added to, never assigned anew; the global ezpopmenu_* functions are the ones the onmouseover
 * attributes called, so this works with the old and the new ezpopupmenu.js and in every admin design. The event
 * stops at the item. Set up once, however often this file is printed.
 */
( function()
{
    if ( window.eZFlowMenu ) return;
    window.eZFlowMenu = { 'version': 1 };

    function register()
    {
        var menus = window.menuArray;
        if ( !menus || !document.querySelectorAll ) return;
        var i, el, entry;

        var subMenus = document.querySelectorAll( '[data-ezflow-menu-depth][id]' );
        for ( i = 0; i < subMenus.length; i++ )
        {
            el = subMenus[i];
            entry = menus[el.id];
            if ( !entry )
            {
                entry = menus[el.id] = { 'depth': parseInt( el.getAttribute( 'data-ezflow-menu-depth' ), 10 ) || 0, 'elements': {} };
            }
            if ( !entry['elements'] ) entry['elements'] = {};
        }

        var items = document.querySelectorAll( 'a[data-ezflow-menu], a[data-ezflow-submenu]' );
        for ( i = 0; i < items.length; i++ )
        {
            el = items[i];
            if ( el.getAttribute( 'data-ezflow-ready' ) ) continue;
            el.setAttribute( 'data-ezflow-ready', '1' );
            var menu = menus[el.getAttribute( 'data-ezflow-menu' )];
            if ( el.id && menu && el.hasAttribute( 'data-ezflow-menu-url' ) )
            {
                if ( !menu['elements'] ) menu['elements'] = {};
                menu['elements'][el.id] = { 'url': el.getAttribute( 'data-ezflow-menu-url' ) };
            }
            el.addEventListener( 'mouseover', pointed );
        }
    }

    function pointed( event )
    {
        var el = event.currentTarget;
        event.stopPropagation();
        var sub = el.getAttribute( 'data-ezflow-submenu' );
        if ( sub )
        {
            event.preventDefault();
            if ( typeof window.ezpopmenu_showSubLevel === 'function' ) window.ezpopmenu_showSubLevel( event, sub, el.id );
        }
        else if ( typeof window.ezpopmenu_mouseOver === 'function' )
        {
            window.ezpopmenu_mouseOver( el.getAttribute( 'data-ezflow-menu' ) );
        }
    }

    // the menus are printed near the end of the page; the submenu may come after this file
    if ( document.readyState === 'loading' )
    {
        document.addEventListener( 'DOMContentLoaded', register );
    }
    else
    {
        register();
    }
    window.addEventListener( 'load', register );
} )();
