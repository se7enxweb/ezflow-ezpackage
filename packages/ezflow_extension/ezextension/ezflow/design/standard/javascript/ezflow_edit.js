/*
 * ezflow: the frontpage edit views and the page datatype (content/datatype/edit/ezpage.tpl), without inline code, so
 * they work under a Content Security Policy without 'unsafe-inline'. What the inline scripts and on...= attributes
 * did is done here from data attributes:
 *
 *   data-ezflow-confirm="question"     a button that asks first (confirm()); "Cancel" stops the click. Like the
 *                                      block remove button did, it sets the form's DiscardConfirm to 0 first
 *   data-ezflow-discard="question"     the "Discard draft" button: as above (the form's DiscardConfirm set to 0
 *                                      first, so the confirmation page of the plain HTML interface is skipped)
 *   data-ezflow-add-block="attrID"     the block list of the frontpage edit view: the choice names the
 *                                      "Add to block" button (#addtoblock) CustomActionButton[<attrID>_new_item-<value>]
 *   data-ezflow-focus-first            a form whose first text field gets the focus when the page has loaded
 *   data-ezflow-page="{json}"          the page datatype's zone layout and zone tabs (one tab per zone, loaded once
 *                                      from the ezflow/zone view), with blockCfg for the block tools
 *
 *   data-ezflow-date-range             the date presets of the quick search: a preset hides the custom date range
 *
 * Plain JavaScript (an ES module, needs ezflow_core.js); works in every admin design and with the zone content loaded
 * later (the listeners are delegated). Set up once, however often printed.
 */
( function()
{
    if ( window.eZFlowEdit ) return;
    window.eZFlowEdit = { 'version': 2 };
    var eZFlow = window.eZFlow = window.eZFlow || {};

    document.addEventListener( 'click', function( e )
    {
        var el = e.target && e.target.closest ? e.target.closest( '[data-ezflow-confirm], [data-ezflow-discard]' ) : null;
        if ( !el ) return;
        // Both buttons asked through confirmDiscard() before 6.1.9, which set DiscardConfirm to 0 first
        var discardConfirm = el.form ? el.form.querySelector( '[name="DiscardConfirm"]' ) : null;
        if ( discardConfirm ) discardConfirm.value = '0';
        var question = el.hasAttribute( 'data-ezflow-discard' ) ? el.getAttribute( 'data-ezflow-discard' )
                                                                 : el.getAttribute( 'data-ezflow-confirm' );
        if ( !window.confirm( question ) ) e.preventDefault();
    } );

    document.addEventListener( 'change', function( e )
    {
        var select = e.target;
        if ( !select || !select.hasAttribute || !select.hasAttribute( 'data-ezflow-add-block' ) ) return;
        var addToBlock = document.getElementById( 'addtoblock' );
        if ( addToBlock )
        {
            addToBlock.name = 'CustomActionButton[' + select.getAttribute( 'data-ezflow-add-block' ) + '_new_item' + '-' + select.value + ']';
        }
    } );

    window.addEventListener( 'load', function()
    {
        var form = document.querySelector( 'form[data-ezflow-focus-first]' );
        if ( !form ) return;
        for ( var i = 0; i < form.elements.length; i++ )
        {
            if ( form.elements[i].type == 'text' )
            {
                form.elements[i].select();
                form.elements[i].focus();
                return;
            }
        }
    } );

    function zoneTabs( container )
    {
        var data;
        try
        {
            data = JSON.parse( container.getAttribute( 'data-ezflow-page' ) );
        }
        catch ( err )
        {
            return;
        }

        if ( window.eZFlow && eZFlow.ZoneLayout )
        {
            eZFlow.ZoneLayout.cfg = { 'allowedzones': data.allowedzones, 'zonelayout': data.zonelayout };
            eZFlow.ZoneLayout.init();
        }

        var tabs = ( data.tabs || [] ).map( function( tab ) { return { label: tab.label, dataSrc: tab.dataSrc, dataLoaded: false }; } );
        var blockCfg = data.blockCfg;
        var target = document.getElementById( 'zone-tabs-container' );
        if ( !target ) return;

        // Zone tab view: one tab per zone (ARIA tabs), its content loaded once from the ezflow/zone view
        var navset = document.createElement( 'div' ),
            nav = document.createElement( 'ul' ),
            content = document.createElement( 'div' ),
            activeIndex = -1;
        navset.className = 'ezpage-tabs ezpage-tabs-top';
        nav.className = 'ezpage-tabs-nav';
        nav.setAttribute( 'role', 'tablist' );
        content.className = 'ezpage-tabs-content';
        navset.append( nav, content );

        var onDataLoaded = function( tabIndex )
        {
            var cfg = Object.assign( {}, blockCfg, { zone: tabIndex } );
            eZFlow.BlockDD.cfg = cfg;
            eZFlow.BlockDD.init();
            eZFlow.BlockCollapse.init();
            eZFlow.ScheduleDialog.init();
            BlockDDInit.cfg = cfg;
            BlockDDInit();
        };

        var loadTab = function( tabIndex )
        {
            var tab = tabs[tabIndex];
            if ( tab.dataLoaded || tab.loading ) return;
            tab.loading = true;
            content.classList.add( 'loading' );
            content.setAttribute( 'aria-busy', 'true' );
            eZFlow.io.get( tab.dataSrc ).then( function( html )
            {
                tab.contentEl.innerHTML = html;
                tab.dataLoaded = true;
                onDataLoaded( tabIndex );
            } ).catch( function() {} ).then( function()
            {
                tab.loading = false;
                content.classList.remove( 'loading' );
                content.removeAttribute( 'aria-busy' );
            } );
        };

        var setActiveIndex = function( tabIndex, fireChange )
        {
            if ( tabIndex === activeIndex || !tabs[tabIndex] ) return;
            if ( tabs[activeIndex] )
            {
                tabs[activeIndex].li.classList.remove( 'selected' );
                tabs[activeIndex].li.removeAttribute( 'title' );
                tabs[activeIndex].a.setAttribute( 'aria-selected', 'false' );
                tabs[activeIndex].a.tabIndex = -1;
                tabs[activeIndex].contentEl.classList.add( 'ezpage-tabs-hidden' );
                tabs[activeIndex].contentEl.hidden = true;
            }
            activeIndex = tabIndex;
            tabs[tabIndex].li.classList.add( 'selected' );
            tabs[tabIndex].li.setAttribute( 'title', 'active' );
            tabs[tabIndex].a.setAttribute( 'aria-selected', 'true' );
            tabs[tabIndex].a.tabIndex = 0;
            tabs[tabIndex].contentEl.classList.remove( 'ezpage-tabs-hidden' );
            tabs[tabIndex].contentEl.hidden = false;
            loadTab( tabIndex );

            if ( fireChange )
            {
                eZFlow.Cookie.set( 'eZPageActiveTabIndex', tabIndex, '/' );
                BlockDDInit.cfg.zone = tabIndex;
            }
        };

        tabs.forEach( function( tab, i )
        {
            tab.li = document.createElement( 'li' );
            tab.li.setAttribute( 'role', 'presentation' );
            tab.a = document.createElement( 'a' );
            tab.a.href = '#';
            tab.a.id = 'ezpage-tab-' + i;
            tab.a.setAttribute( 'role', 'tab' );
            tab.a.setAttribute( 'aria-controls', 'ezpage-tabpanel-' + i );
            tab.a.setAttribute( 'aria-selected', 'false' );
            tab.a.tabIndex = -1;
            var em = document.createElement( 'em' );
            em.innerHTML = tab.label;
            tab.a.appendChild( em );
            tab.a.addEventListener( 'click', function( e )
            {
                e.preventDefault();
                setActiveIndex( i, true );
            } );
            tab.a.addEventListener( 'keydown', function( e )
            {
                var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -2;
                if ( next === -2 ) return;
                e.preventDefault();
                next = ( next + tabs.length ) % tabs.length;
                setActiveIndex( next, true );
                tabs[next].a.focus();
            } );
            tab.li.appendChild( tab.a );
            nav.appendChild( tab.li );
            tab.contentEl = document.createElement( 'div' );
            tab.contentEl.className = 'ezpage-tabs-hidden';
            tab.contentEl.id = 'ezpage-tabpanel-' + i;
            tab.contentEl.setAttribute( 'role', 'tabpanel' );
            tab.contentEl.setAttribute( 'aria-labelledby', tab.a.id );
            tab.contentEl.hidden = true;
            content.appendChild( tab.contentEl );
        } );

        target.appendChild( navset );

        var activeTabIndex = eZFlow.Cookie.get( 'eZPageActiveTabIndex' );
        if ( activeTabIndex && tabs[ parseInt( activeTabIndex, 10 ) ] )
            setActiveIndex( parseInt( activeTabIndex, 10 ), false );
        else
            setActiveIndex( 0, false );
    }

    // The date range of the quick search in the frontpage edit view: a preset hides the custom range (the
    // onclick="showDateRange(this)" of earlier versions called a function that no longer existed)
    document.addEventListener( 'change', function( e )
    {
        var radio = e.target;
        if ( !radio || !radio.matches || !radio.matches( 'input[name="SearchDate"][data-ezflow-date-range]' ) ) return;
        var form = radio.closest( 'form' ) || document;
        var custom = form.querySelector( '.date-range-selection' );
        if ( custom ) custom.hidden = radio.value !== '-1';
    } );

    function start()
    {
        document.querySelectorAll( '[data-ezflow-page]' ).forEach( function( container )
        {
            if ( container.getAttribute( 'data-ezflow-page-ready' ) ) return;
            container.setAttribute( 'data-ezflow-page-ready', '1' );
            zoneTabs( container );
        } );
        document.querySelectorAll( '.date-range-selection' ).forEach( function( el ) { el.hidden = true; } );
    }

    if ( document.readyState === 'loading' )
        document.addEventListener( 'DOMContentLoaded', start );
    else
        start();
} )();
