/**
 * @author ls
 *
 * Publishing schedule dialog of the block items (page datatype editor and
 * push to block page). Clicking an img.schedule-handler opens the dialog with
 * the item's publication time; Store writes the new timestamp into the first
 * input and the new date into the first span next to the handler.
 * Requires jQuery and ezflowcalendar.js.
 */

var eZFlow = window.eZFlow || {};
window.eZFlow = eZFlow;

eZFlow.ScheduleDialog = function( $ ) {

    //Private

    var CurrentHandler = false,
        CurrentHandlerInput = false,
        CurrentHandlerLabel = false,
        Dialog = null,
        Calendar = null;

    var getHandlers = function() {
        return $( 'img.schedule-handler' ).get();
    };

    var hideDialog = function() {
        if ( Dialog ) {
            Dialog.style.display = 'none';
        }
    };

    var handleDialogSubmit = function() {
        // Get year, month, day
        var year = document.getElementById("schedule-dialog-year").value;
        var month = document.getElementById("schedule-dialog-month").value;
        var day = document.getElementById("schedule-dialog-day").value;

        // Get hour, minute
        var hour = document.getElementById("schedule-dialog-hour").value;
        var minute = document.getElementById("schedule-dialog-minute").value;

        // Convert to timestamp and assing as new value to input field
        var timestamp = Number( new Date( year, ( month - 1 ), day, hour, minute ) ) / 1000;

        CurrentHandlerInput.value = timestamp;
        CurrentHandlerLabel.innerHTML = day + "/" + month + "/" + year + " " + hour + ":" + minute;

        hideDialog();
    };

    var handleDialogCancel = function() {
        hideDialog();
    };

    var showDialog = function() {
        // Search for input and span elements which are time holders for queue items
        CurrentHandlerInput = $( CurrentHandler.parentNode ).find( 'input' )[0];
        CurrentHandlerLabel = $( CurrentHandler.parentNode ).find( 'span' )[0];

        var date = new Date();
        var hasTimestamp = false;
        // Check if CurrentHandlerInput exists and has a correct value
        if ( CurrentHandlerInput
                && !isNaN( parseInt( CurrentHandlerInput.value ) ) ) {
            date = new Date( parseInt( CurrentHandlerInput.value * 1000 ) );
            hasTimestamp = true;
        }

        var year = date.getFullYear();
        var month = ( date.getMonth() + 1 );
        var day = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();

        // Set year, month and day to text input fields
        document.getElementById("schedule-dialog-year").value = year;
        document.getElementById("schedule-dialog-month").value = month;
        document.getElementById("schedule-dialog-day").value = day;

        // Set hour, minute to text input fields
        document.getElementById("schedule-dialog-hour").value = hour;
        document.getElementById("schedule-dialog-minute").value = minutes;

        Calendar.setPageDate( date );
        Calendar.select( hasTimestamp ? date : null );
        Calendar.render();
        Calendar.show();

        Dialog.style.display = 'block';
    };

    var initDialog = function() {
        var hasDialog = document.getElementById("schedule-dialog");

        if(!hasDialog) {
            var body = "<div class=\"object-left\">";
                body += "<div class=\"block\">";
                body += "<div class=\"element\"><label>Month:</label><input id=\"schedule-dialog-month\" type=\"text\" value=\"\" class=\"schedule-dialog-input\" /></div>";
                body += "<div class=\"element\"><label>Day:</label><input id=\"schedule-dialog-day\" type=\"text\" value=\"\" class=\"schedule-dialog-input\" /></div>";
                body += "<div class=\"element\"><label>Year:</label><input id=\"schedule-dialog-year\" type=\"text\" value=\"\" class=\"schedule-dialog-input\" /></div>";
                body += "</div>";
                body += "<div class=\"block\">";
                body += "<div class=\"element\"><label>Hour:</label><input id=\"schedule-dialog-hour\" type=\"text\" value=\"\" class=\"schedule-dialog-input\" /></div>";
                body += "<div class=\"element\"><label>Minute:</label><input id=\"schedule-dialog-minute\" type=\"text\" value=\"\" class=\"schedule-dialog-input\" /></div>";
                body += "</div>";
                body += "</div>";
                body += "<div class=\"object-right\">";
                body += "<div id=\"shedule-calendar-container\"></div>";
                body += "</div>";
                body += "<div class=\"break\"></div>";

            var $dialog = $( '<div id="schedule-dialog" class="ezflow-dialog" role="dialog" aria-labelledby="schedule-dialog_h"></div>' )
                .css( { width: '30em', display: 'none' } )
                .append(
                    $( '<div class="ezflow-panel"></div>' )
                        .append( '<div class="hd" id="schedule-dialog_h"></div>' )
                        .append( $( '<div class="bd" id="schedule-dialog-container"></div>' ).html( body ) )
                        .append( $( '<div class="ft"><span class="button-group"></span></div>' ) )
                        .append( '<a class="container-close" href="#">Close</a>' )
                );

            $( '<button type="button" class="ezflow-button default">Store</button>' )
                .on( 'click', handleDialogSubmit )
                .appendTo( $dialog.find( '.button-group' ) );
            $( '<button type="button" class="ezflow-button">Cancel</button>' )
                .on( 'click', handleDialogCancel )
                .appendTo( $dialog.find( '.button-group' ) );
            $dialog.find( '.container-close' ).on( 'click', function( e ) {
                e.preventDefault();
                handleDialogCancel();
            } );
            // Enter in a field stores the schedule instead of submitting the page form
            $dialog.on( 'keydown', 'input', function( e ) {
                if ( e.which === 13 ) {
                    e.preventDefault();
                    handleDialogSubmit();
                }
            } );

            var datatypeContainer = document.getElementById('page-datatype-container') || document.body;
            $dialog.appendTo( datatypeContainer );
            Dialog = $dialog[0];

            // Create Calendar instance, fill up input fields with the selected date
            Calendar = new eZFlowCalendar( "shedule-calendar", document.getElementById( "shedule-calendar-container" ), {
                onSelect: function( year, month, day ) {
                    // Set year, month and day to text input fields
                    document.getElementById("schedule-dialog-year").value = year;
                    document.getElementById("schedule-dialog-month").value = month;
                    document.getElementById("schedule-dialog-day").value = day;
                }
            } );

            Calendar.hide();
            Calendar.render();
        }

        var handlers = getHandlers();

        var handlersCount = handlers.length;

        for(var i = 0; i < handlersCount; i++) {
            var handler = handlers[i];

            $( handler ).off( 'click.ezflowschedule' ).on( 'click.ezflowschedule', function() {
                // Assign clicked handler element to CurrentHandler variable
                CurrentHandler = this;
                $( '#schedule-dialog_h' ).text( CurrentHandler.title );

                hideDialog();
                showDialog();
            } );
        }
    };

    // Public

    return {

        init: function() {
            initDialog();
        },

        cfg: function() {

        }

    };
}( jQuery );
