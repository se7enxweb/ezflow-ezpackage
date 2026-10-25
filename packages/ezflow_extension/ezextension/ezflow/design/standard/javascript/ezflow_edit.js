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
 * Plain JavaScript and the jQuery the page already loads (ezjsc::jquery) for the zone tabs; works in every admin
 * design and with the zone content loaded later (the listeners are delegated). Set up once, however often printed.
 */
( function()
{
    if ( window.eZFlowEdit ) return;
    window.eZFlowEdit = { 'version': 1 };

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

    function zoneTabs( $, container )
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

        var tabs = [];
        $.each( data.tabs || [], function( i, tab )
        {
            tabs.push( { label: tab.label, dataSrc: tab.dataSrc, dataLoaded: false } );
        } );
        var blockCfg = data.blockCfg;

        // Zone tab view: one tab per zone, its content loaded once from the ezflow/zone view
        var navset = $( '<div class="ezpage-tabs ezpage-tabs-top"><ul class="ezpage-tabs-nav"></ul><div class="ezpage-tabs-content"></div></div>' ),
            nav = navset.children( '.ezpage-tabs-nav' ),
            content = navset.children( '.ezpage-tabs-content' ),
            activeIndex = -1;

        var onDataLoaded = function( tabIndex )
        {
            var cfg = $.extend( {}, blockCfg, { zone: tabIndex } );

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

            if ( tab.dataLoaded || tab.loading )
            {
                return;
            }
            tab.loading = true;
            content.addClass( 'loading' );
            $.ajax( { type: 'GET', url: tab.dataSrc, dataType: 'html' } )
                .done( function( html )
                {
                    tab.contentEl.innerHTML = html;
                    tab.dataLoaded = true;
                    onDataLoaded( tabIndex );
                } )
                .always( function()
                {
                    tab.loading = false;
                    content.removeClass( 'loading' );
                } );
        };

        var setActiveIndex = function( tabIndex, fireChange )
        {
            if ( tabIndex === activeIndex || !tabs[tabIndex] )
            {
                return;
            }
            if ( tabs[activeIndex] )
            {
                tabs[activeIndex].li.removeClass( 'selected' ).removeAttr( 'title' );
                $( tabs[activeIndex].contentEl ).addClass( 'ezpage-tabs-hidden' );
            }
            activeIndex = tabIndex;
            tabs[tabIndex].li.addClass( 'selected' ).attr( 'title', 'active' );
            $( tabs[tabIndex].contentEl ).removeClass( 'ezpage-tabs-hidden' );
            loadTab( tabIndex );

            if ( fireChange )
            {
                eZFlow.Cookie.set( "eZPageActiveTabIndex", tabIndex, "/" );
                BlockDDInit.cfg.zone = tabIndex;
            }
        };

        $.each( tabs, function( i, tab )
        {
            tab.li = $( '<li><a href="#"><em></em></a></li>' );
            tab.li.find( 'em' ).html( tab.label );
            tab.li.children( 'a' ).on( 'click', function( e )
            {
                e.preventDefault();
                setActiveIndex( i, true );
            } );
            nav.append( tab.li );
            tab.contentEl = $( '<div class="ezpage-tabs-hidden"></div>' ).appendTo( content )[0];
        } );

        navset.appendTo( '#zone-tabs-container' );

        var activeTabIndex = eZFlow.Cookie.get( 'eZPageActiveTabIndex' );

        if ( activeTabIndex && tabs[ parseInt( activeTabIndex, 10 ) ] )
        {
            setActiveIndex( parseInt( activeTabIndex, 10 ), false );
        }
        else
        {
            setActiveIndex( 0, false );
        }
    }

    function start()
    {
        if ( !window.jQuery ) return;
        jQuery( function( $ )
        {
            $( '[data-ezflow-page]' ).each( function()
            {
                if ( this.getAttribute( 'data-ezflow-page-ready' ) ) return;
                this.setAttribute( 'data-ezflow-page-ready', '1' );
                zoneTabs( $, this );
            } );
        } );
    }

    if ( document.readyState === 'loading' )
        document.addEventListener( 'DOMContentLoaded', start );
    else
        start();
} )();
