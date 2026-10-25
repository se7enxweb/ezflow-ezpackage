/**
 * eZ Flow calendar widget for Exponential.
 *
 * A small month calendar used by the block item schedule dialog and by the
 * timeline preview. It renders one or more month pages side by side, lets the
 * user page through the months and calls onSelect( year, month, day ) when a
 * day is clicked (month is 1 based).
 *
 *   var cal = new eZFlowCalendar( 'my-cal', containerElement, { pages: 3, onSelect: fn } );
 *   cal.render();
 *   cal.setPageDate( new Date() ); cal.select( new Date() ); cal.render();
 *   cal.show(); cal.hide();
 *
 * Requires jQuery.
 */
var eZFlowCalendar = (function( $ ) {
    'use strict';

    var WEEKDAYS_SHORT = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ],
        WEEKDAYS_LONG = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
        MONTHS_LONG = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July',
                        'August', 'September', 'October', 'November', 'December' ],
        MONTHS_SHORT = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

    function sameDay( a, b )
    {
        return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function Calendar( id, container, options )
    {
        var today = new Date();

        this.id = id;
        this.container = typeof container === 'string' ? document.getElementById( container ) : container;
        this.options = $.extend( { pages: 1, onSelect: null }, options || {} );
        this.pageDate = new Date( today.getFullYear(), today.getMonth(), 1 );
        this.selected = null;
        this.WEEKDAYS_LONG = WEEKDAYS_LONG;
        this.MONTHS_LONG = MONTHS_LONG;
        this.MONTHS_SHORT = MONTHS_SHORT;

        var self = this;
        $( this.container )
            .on( 'click.ezflowcal', 'a.calnavleft', function( e ) {
                e.preventDefault();
                self.previousMonth();
            } )
            .on( 'click.ezflowcal', 'a.calnavright', function( e ) {
                e.preventDefault();
                self.nextMonth();
            } )
            .on( 'click.ezflowcal', 'td.selectable', function( e ) {
                e.preventDefault();
                var parts = this.getAttribute( 'data-date' ).split( '-' ),
                    year = parseInt( parts[0], 10 ),
                    month = parseInt( parts[1], 10 ),
                    day = parseInt( parts[2], 10 );

                self.selected = new Date( year, month - 1, day );
                self.render();
                if ( self.options.onSelect )
                {
                    self.options.onSelect.call( self, year, month, day );
                }
            } );
    }

    Calendar.prototype.setPageDate = function( date )
    {
        this.pageDate = new Date( date.getFullYear(), date.getMonth(), 1 );
    };

    Calendar.prototype.select = function( date )
    {
        this.selected = date ? new Date( date.getFullYear(), date.getMonth(), date.getDate() ) : null;
    };

    Calendar.prototype.previousMonth = function()
    {
        this.pageDate = new Date( this.pageDate.getFullYear(), this.pageDate.getMonth() - 1, 1 );
        this.render();
    };

    Calendar.prototype.nextMonth = function()
    {
        this.pageDate = new Date( this.pageDate.getFullYear(), this.pageDate.getMonth() + 1, 1 );
        this.render();
    };

    Calendar.prototype.renderPage = function( pageIndex, pageDate, isFirst, isLast )
    {
        var today = new Date(),
            year = pageDate.getFullYear(),
            month = pageDate.getMonth(),
            html = '',
            start = new Date( year, month, 1 - new Date( year, month, 1 ).getDay() ),
            week, day, cell, classes;

        html += '<table class="ezflow-calendar y' + year + '" cellspacing="0" id="' +
                ( this.options.pages > 1 ? this.id + '_' + pageIndex : this.id ) + '">';
        html += '<thead><tr><th colspan="7" class="calhead"><div class="calheader">';
        if ( isFirst )
        {
            html += '<a class="calnavleft" href="#">&#160;</a>';
        }
        html += MONTHS_LONG[month] + ' ' + year;
        if ( isLast )
        {
            html += '<a class="calnavright" href="#">&#160;</a>';
        }
        html += '</div></th></tr><tr class="calweekdayrow">';
        for ( day = 0; day < 7; day++ )
        {
            html += '<th class="calweekdaycell">' + WEEKDAYS_SHORT[day] + '</th>';
        }
        html += '</tr></thead><tbody class="m' + ( month + 1 ) + ' calbody">';

        for ( week = 0; week < 6; week++ )
        {
            html += '<tr>';
            for ( day = 0; day < 7; day++ )
            {
                cell = new Date( start.getFullYear(), start.getMonth(), start.getDate() + week * 7 + day );
                classes = 'calcell wd' + day + ' d' + cell.getDate();
                if ( cell.getMonth() !== month )
                {
                    html += '<td class="' + classes + ' oom">' + cell.getDate() + '</td>';
                    continue;
                }
                classes += ' selectable';
                if ( sameDay( cell, today ) )
                {
                    classes += ' today';
                }
                if ( sameDay( cell, this.selected ) )
                {
                    classes += ' selected';
                }
                html += '<td class="' + classes + '" data-date="' + cell.getFullYear() + '-' + ( cell.getMonth() + 1 ) + '-' + cell.getDate() + '">' +
                        '<a href="#" class="selector">' + cell.getDate() + '</a></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        return html;
    };

    Calendar.prototype.render = function()
    {
        var pages = this.options.pages,
            html = '',
            i, pageDate;

        if ( pages > 1 )
        {
            for ( i = 0; i < pages; i++ )
            {
                pageDate = new Date( this.pageDate.getFullYear(), this.pageDate.getMonth() + i, 1 );
                html += '<div class="groupcal' + ( i === 0 ? ' first-of-type' : '' ) + ( i === pages - 1 ? ' last-of-type' : '' ) + '">' +
                        this.renderPage( i, pageDate, i === 0, i === pages - 1 ) + '</div>';
            }
            html += '<div class="calclear"></div>';
        }
        else
        {
            html = this.renderPage( 0, this.pageDate, true, true );
        }

        $( this.container )
            .addClass( 'ezflow-calcontainer' )
            .addClass( pages > 1 ? 'multi' : 'single' )
            .html( html );
    };

    Calendar.prototype.show = function()
    {
        this.container.style.display = 'block';
    };

    Calendar.prototype.hide = function()
    {
        this.container.style.display = 'none';
    };

    return Calendar;
})( jQuery );
