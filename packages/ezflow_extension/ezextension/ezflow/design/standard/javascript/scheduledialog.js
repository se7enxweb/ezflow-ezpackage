/**
 * Publishing schedule dialog of the block items (page datatype editor and push to block page); plain JavaScript, an
 * ES module, needs ezflowcalendar.js. Clicking (or Enter on) an img.schedule-handler opens a native <dialog> with the
 * item's publication time; Store writes the new timestamp into the first input and the new date into the first span
 * next to the handler. Escape and Cancel close it; the focus returns to the handler.
 */
( function () {
    'use strict';
    var eZFlow = window.eZFlow = window.eZFlow || {};
    if ( eZFlow.ScheduleDialog && eZFlow.ScheduleDialog.version === 2 ) return;

    var CurrentHandler = false, CurrentHandlerInput = false, CurrentHandlerLabel = false, Dialog = null, Calendar = null;
    var field = function ( id ) { return document.getElementById( 'schedule-dialog-' + id ); };

    var hideDialog = function () {
        if ( !Dialog ) return;
        if ( Dialog.open && Dialog.close ) Dialog.close();
        Dialog.hidden = true;
        if ( CurrentHandler && CurrentHandler.focus ) CurrentHandler.focus();
    };

    var handleDialogSubmit = function () {
        var year = field( 'year' ).value, month = field( 'month' ).value, day = field( 'day' ).value,
            hour = field( 'hour' ).value, minute = field( 'minute' ).value;
        var timestamp = Number( new Date( year, month - 1, day, hour, minute ) ) / 1000;
        if ( isNaN( timestamp ) ) { field( 'day' ).focus(); return; }
        CurrentHandlerInput.value = timestamp;
        CurrentHandlerLabel.textContent = day + '/' + month + '/' + year + ' ' + hour + ':' + minute;
        hideDialog();
    };

    var showDialog = function () {
        CurrentHandlerInput = CurrentHandler.parentNode.querySelector( 'input' );
        CurrentHandlerLabel = CurrentHandler.parentNode.querySelector( 'span' );
        var date = new Date(), hasTimestamp = false;
        if ( CurrentHandlerInput && !isNaN( parseInt( CurrentHandlerInput.value, 10 ) ) ) {
            date = new Date( parseInt( CurrentHandlerInput.value, 10 ) * 1000 );
            hasTimestamp = true;
        }
        field( 'year' ).value = date.getFullYear();
        field( 'month' ).value = date.getMonth() + 1;
        field( 'day' ).value = date.getDate();
        field( 'hour' ).value = date.getHours();
        field( 'minute' ).value = date.getMinutes();
        Calendar.setPageDate( date );
        Calendar.select( hasTimestamp ? date : null );
        Calendar.render();
        Calendar.show();
        Dialog.hidden = false;
        if ( Dialog.showModal && !Dialog.open ) Dialog.showModal();
        field( 'month' ).focus();
    };

    var input = function ( id, label ) {
        return '<div class="element"><label for="schedule-dialog-' + id + '">' + label + ':</label>' +
               '<input id="schedule-dialog-' + id + '" type="number" inputmode="numeric" value="" class="schedule-dialog-input" /></div>';
    };

    var initDialog = function () {
        if ( !document.getElementById( 'schedule-dialog' ) ) {
            Dialog = document.createElement( 'dialog' );
            Dialog.id = 'schedule-dialog';
            Dialog.className = 'ezflow-dialog';
            Dialog.setAttribute( 'aria-labelledby', 'schedule-dialog_h' );
            Dialog.hidden = true;
            Dialog.innerHTML = '<div class="ezflow-panel"><h2 class="hd" id="schedule-dialog_h"></h2>' +
                '<div class="bd" id="schedule-dialog-container"><div class="object-left">' +
                '<div class="block">' + input( 'month', 'Month' ) + input( 'day', 'Day' ) + input( 'year', 'Year' ) + '</div>' +
                '<div class="block">' + input( 'hour', 'Hour' ) + input( 'minute', 'Minute' ) + '</div>' +
                '</div><div class="object-right"><div id="shedule-calendar-container"></div></div><div class="break"></div></div>' +
                '<div class="ft"><span class="button-group">' +
                '<button type="button" class="ezflow-button default" data-schedule-store>Store</button>' +
                '<button type="button" class="ezflow-button" data-schedule-cancel>Cancel</button></span></div>' +
                '<button type="button" class="container-close" data-schedule-cancel>Close</button></div>';
            Dialog.querySelector( '[data-schedule-store]' ).addEventListener( 'click', handleDialogSubmit );
            Dialog.querySelectorAll( '[data-schedule-cancel]' ).forEach( function ( b ) { b.addEventListener( 'click', hideDialog ); } );
            Dialog.addEventListener( 'cancel', function ( e ) { e.preventDefault(); hideDialog(); } );
            // Enter in a field stores the schedule instead of submitting the page form
            Dialog.addEventListener( 'keydown', function ( e ) {
                if ( e.key === 'Enter' && e.target.matches( 'input' ) ) { e.preventDefault(); handleDialogSubmit(); }
            } );
            ( document.getElementById( 'page-datatype-container' ) || document.body ).appendChild( Dialog );

            Calendar = new window.eZFlowCalendar( 'shedule-calendar', document.getElementById( 'shedule-calendar-container' ), {
                onSelect: function ( year, month, day ) {
                    field( 'year' ).value = year;
                    field( 'month' ).value = month;
                    field( 'day' ).value = day;
                }
            } );
            Calendar.hide();
            Calendar.render();
        } else if ( !Dialog ) {
            Dialog = document.getElementById( 'schedule-dialog' );
        }

        document.querySelectorAll( 'img.schedule-handler' ).forEach( function ( handler ) {
            if ( handler.__ezflowSchedule ) return;
            handler.__ezflowSchedule = true;
            if ( !handler.hasAttribute( 'tabindex' ) ) handler.tabIndex = 0;
            handler.setAttribute( 'role', 'button' );
            var open = function () {
                CurrentHandler = handler;
                document.getElementById( 'schedule-dialog_h' ).textContent = handler.title;
                showDialog();
            };
            handler.addEventListener( 'click', open );
            handler.addEventListener( 'keydown', function ( e ) { if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); open(); } } );
        } );
    };

    eZFlow.ScheduleDialog = { version: 2, init: function () { initDialog(); }, cfg: function () {} };
}() );
