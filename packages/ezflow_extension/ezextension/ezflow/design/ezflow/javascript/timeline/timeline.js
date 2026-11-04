/**
 * Timeline preview (Exponential; plain JavaScript, an ES module): a three month calendar to pick the
 * day and a slider to pick the time; every change fetches the blocks of the
 * node as they will look at that moment from the ezflow/preview view.
 *
 * The template sets eZFlowTimeline.slider.* and eZFlowTimeline.calendar.*
 * and then calls eZFlowTimeline.init(). Needs ezflow_core.js and ezflowcalendar.js.
 */
var eZFlowTimeline = window.eZFlowTimeline = window.eZFlowTimeline || { calendar: {}, slider: {}, common: {} };

(function( timeline ) {
    'use strict';

// Calendar Start

// Custom fuction for displaying the calendar
timeline.calendar.cShow = function()
{
    document.getElementById( "show_calendar" ).style.backgroundImage = timeline.calendar.arrowImageUP;
    document.getElementById( "slider-container" ).style.marginTop = "17.3em";

    timeline.calendar.cal1.show();
    timeline.calendar.isVisible = true;
};

// Custom function for closing the calendar
timeline.calendar.cClose = function()
{
    document.getElementById( "show_calendar" ).style.backgroundImage = timeline.calendar.arrowImageDown;
    document.getElementById( "slider-container" ).style.marginTop = "15px";

    timeline.calendar.cal1.hide();
    timeline.calendar.isVisible = false;
};

// Toogle calendar visibility
timeline.calendar.toogleCalendar = function()
{
    if ( timeline.calendar.isVisible == false )
    {
        timeline.calendar.cShow();
    }
    else
    {
        timeline.calendar.cClose();
    }
};

timeline.calendar.onSelectDate = function( year, month, day )
{
    var weekdays = this.WEEKDAYS_LONG;
    var months = this.MONTHS_LONG;

    var date = new Date();
    date.setFullYear( year, month - 1, day );
    date.setHours( parseInt( timeline.slider.timeStartHours, 10 ) );
    date.setMinutes( parseInt( timeline.slider.timeStartMinutes, 10 ) );
    date.setSeconds( 0 );

    var longDateString = weekdays[date.getDay()]; // Name of Day

    // Pad the day of month number with a 0 if needed...
    if ( day < 10 )
        longDateString = longDateString + "  0" + day.toString();
    else
        longDateString = longDateString + "  " + day.toString();

    longDateString = longDateString + "  " + months[month - 1];   // Month
    longDateString = longDateString + "  " + year.toString();     // Year

    document.getElementById( "show_calendar" ).innerHTML = longDateString;

    // Update our internal timestamp, in seconds
    timeline.slider.timestampStart = Math.floor( date.getTime() / 1000 );

    // Ok, we're done, close the calendar.
    timeline.calendar.cClose();

    // Trigger update of blocks
    timeline.common.updateBlocks();
};

timeline.calendar.init = function()
{
    timeline.calendar.cal1 = new eZFlowCalendar( "cal1", document.getElementById( "cal1Container" ),
                                                 { pages: 3, onSelect: timeline.calendar.onSelectDate } );

    var calendar = document.getElementById( "show_calendar" );
    timeline.calendar.cClose();

    timeline.calendar.cal1.render();

    if ( calendar ) calendar.addEventListener( "click", timeline.calendar.toogleCalendar );
};
// End Calendar



// Slider start

/**
 * Horizontal slider: the thumb moves inside the background between minimum
 * and maximum pixels, snapping to every tickSize pixels. The background takes
 * clicks, drags and the arrow, Home and End keys. Listeners: change( value )
 * while the value changes, slideEnd() when a move is over.
 */
function HorizontalSlider( bg, thumb, minimum, maximum, tickSize )
{
    var self = this;

    this.bg = document.getElementById( bg );
    this.thumb = document.getElementById( thumb );
    this.minimum = minimum;
    this.maximum = minimum + Math.floor( ( maximum - minimum ) / tickSize ) * tickSize;
    this.tickSize = tickSize;
    this.keyIncrement = 20;
    this.value = 0;
    this.listeners = { change: [], slideEnd: [] };

    if ( !this.bg.hasAttribute( 'tabindex' ) )
    {
        this.bg.setAttribute( 'tabindex', '-1' );
    }

    this.bg.addEventListener( 'pointerdown', function( e ) {
        if ( e.pointerType === 'mouse' && e.button !== 0 )
        {
            return;
        }
        e.preventDefault();
        self.bg.focus();

        var thumbLeft = self.thumb.getBoundingClientRect().left + window.pageXOffset,
            grab = self.thumb.contains( e.target ) ?
                   e.pageX - thumbLeft : self.thumb.offsetWidth / 2;

        var moveTo = function( pageX ) {
            var origin = self.bg.getBoundingClientRect().left + window.pageXOffset;
            self.setValue( pageX - grab - origin, false );
        };

        moveTo( e.pageX );

        var onMove = function( ev ) { moveTo( ev.pageX ); };
        var onUp = function() {
            document.removeEventListener( 'pointermove', onMove );
            document.removeEventListener( 'pointerup', onUp );
            document.removeEventListener( 'pointercancel', onUp );
            self.fire( 'slideEnd' );
        };
        document.addEventListener( 'pointermove', onMove );
        document.addEventListener( 'pointerup', onUp );
        document.addEventListener( 'pointercancel', onUp );
    } );

    this.bg.addEventListener( 'keydown', function( e ) {
        var newValue = null;

        switch ( { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Home: 36, End: 35 }[e.key] || e.which )
        {
            case 37: // left
            case 38: // up
                newValue = self.value - self.keyIncrement;
                break;
            case 39: // right
            case 40: // down
                newValue = self.value + self.keyIncrement;
                break;
            case 36: // home
                newValue = self.minimum;
                break;
            case 35: // end
                newValue = self.maximum;
                break;
        }
        if ( newValue !== null )
        {
            e.preventDefault();
            self.setValue( newValue, false );
            self.fire( 'slideEnd' );
        }
    } );
}

HorizontalSlider.prototype.setValue = function( value, silent )
{
    var snapped = this.minimum + Math.round( ( value - this.minimum ) / this.tickSize ) * this.tickSize;

    snapped = Math.max( this.minimum, Math.min( this.maximum, snapped ) );
    this.thumb.style.left = snapped + 'px';

    if ( snapped !== this.value )
    {
        this.value = snapped;
        if ( !silent )
        {
            this.fire( 'change', snapped );
        }
    }
};

HorizontalSlider.prototype.getValue = function()
{
    return this.value;
};

HorizontalSlider.prototype.subscribe = function( type, fn )
{
    this.listeners[type].push( fn );
};

HorizontalSlider.prototype.fire = function( type, arg )
{
    for ( var i = 0; i < this.listeners[type].length; i++ )
    {
        this.listeners[type][i].call( this, arg );
    }
};

// Slider event: while sliding
timeline.slider.onSliderChange = function( offsetFromStart )
{
    var timestamp = timeline.slider.getTimestamp();

    var date = new Date();
    date.setTime( timestamp * 1000 ); // setTime() takes milliseconds, not seconds.

    var hours = date.getHours();
    var minutes = date.getMinutes();

    if ( hours < 10 )
        hours = "0" + hours;

    if ( minutes < 10 )
        minutes = "0" + minutes;

    var label = document.getElementById( "scrubbing-time" );
    label.style.left = offsetFromStart + timeline.slider.slideLabelInitalSpacing + "px";

    // Update our scrubbing time label.
    label.innerHTML = hours + ":" + minutes;
};

// Slider event: Finishing sliding
timeline.slider.onSliderEnd = function()
{
    timeline.common.updateBlocks();
};

timeline.slider.init = function()
{
    timeline.slider.bg = "slider-bg";
    timeline.slider.thumb = "slider-thumb";

    // The slider can move 0 pixels up
    var topConstraint = 0;

    // #slider-end width + 20.
    var bottomConstraint = 882;

    // Custom scale factor for converting the pixel offset into a real value
    timeline.slider.scaleFactor = 1;

    var tickSize = 20;
    timeline.slider.slider1 = new HorizontalSlider( timeline.slider.bg, timeline.slider.thumb,
                                                    topConstraint, bottomConstraint, tickSize );

    // set inital position
    timeline.slider.slider1.setValue( timeline.slider.initalSliderPosition, true );

    timeline.slider.slider1.subscribe( "change", timeline.slider.onSliderChange );
    timeline.slider.slider1.subscribe( "slideEnd", timeline.slider.onSliderEnd );

    timeline.slider.loadingBarHidden = true;
};

// Slider utility method: Generate timestamp from the pixel positon of the thumb.
timeline.slider.getTimestamp = function()
{
    var offsetFromStart = timeline.slider.slider1.getValue();

    var timestamp = timeline.slider.timestampFromPixels( offsetFromStart,
                                    timeline.slider.middeStartPx, timeline.slider.rightStartPx );
    timestamp = timeline.slider.timestampStart + timestamp;

    return timestamp;
};

// Show/Hide slider progress bar
timeline.slider.toogleProgressBar = function()
{
    var loadingNode = document.getElementById( "timeline-loader" );
    if ( timeline.slider.loadingBarHidden )
    {
        loadingNode.style.display = "block";
        timeline.slider.loadingBarHidden = false;
    }
    else
    {
        loadingNode.style.display = "none";
        timeline.slider.loadingBarHidden = true;
    }
};

// Slider utility method: generate a timestamp from the pixel offset where the slider thumb is located.
timeline.slider.timestampFromPixels = function( currentPx, middleStartPx, rightStartPx )
{
    // The slider is devided into 3 different parts
    // Left part: Low precision where 1 tick = 60 min = 20px.
    // Middle part: High precision where 1 tick = 15 min = 20px.
    // Right part: Low precision where 1 tick = 60 min = 20px.

    // This function works by generating a timestamp for each part of the slider
    // and adding them together at the end.

    // middelStartPx and rightStartPx indicated where the middle and right
    // parts starts in pixels. The left part starts at 0px.

    var leftPart = 0;
    var middlePart = 0;
    var rightPart = 0;

    // Are we in the right part of the slider?
    if ( currentPx > rightStartPx )
    {
        rightPart = currentPx - rightStartPx;

        // One tick (1px is 60 minutes or 3600 seconds)
        rightPart = rightPart * ( 3600 / 20 );
    }

    // Are we in the range of middle part of the slider?
    if ( currentPx > middleStartPx )
    {
        // If rightPart is set we need to calcuate timestamp for the whole middel
        // part, but only middle part, nothing else.
        if ( rightPart > 0 )
            middlePart = rightStartPx - middleStartPx;
        else
            // currentPx is somewhere inside the middle part of the slider. Calculate
            // middle part from where currentPx is.
            middlePart = currentPx - middleStartPx;

        // One tick (1px is 15 minutes or 900 seconds)
        middlePart = middlePart * ( 900 / 20 );
    }

    // Are we in the lower range of the slider?
    if ( currentPx > 0 )
    {
        leftPart = currentPx;

        // If the middlePart is set we should calcuate with all pixels
        // inside the left part of the slider.
        if ( middlePart > 0 )
            leftPart = middleStartPx;

        // One tick (1px is 60 minutes or 3600 seconds)
        leftPart = leftPart * ( 3600 / 20 );
    }

    return leftPart + middlePart + rightPart;
};
// End Slider


// Common namespace, for things shared between the slider and the timeline.

// Decode the escaped xhtml of a block: strip tags, then resolve the entities
var unescapeHTML = function( text )
{
    var div = document.createElement( 'div' );
    div.innerHTML = text.replace( /<\/?[^>]+>/gi, '' );
    return div.textContent;
};

var scriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';

var extractScripts = function( text )
{
    var matchOne = new RegExp( scriptFragment, 'im' );

    return ( text.match( new RegExp( scriptFragment, 'img' ) ) || [] ).map( function( scriptTag ) {
        return scriptTag;
    } );
};

timeline.common.updateBlocks = function()
{
    var timestamp = timeline.slider.getTimestamp();

    // Update the title attribute on the background.  This helps assistive
    // technology to communicate the state change
    var date = new Date();
    date.setTime( timestamp * 1000 ); // setTime() takes milliseconds, not seconds.
    var bg = document.getElementById( timeline.slider.bg );
    if ( bg )
        bg.title = date;

    var fetchURL = timeline.slider.fetchURL;
    var nodeid = timeline.slider.nodeid;

    var sourceURL = fetchURL + "/" + timestamp + "/" + nodeid;

    window.eZFlow.io.get( sourceURL )
        .then( timeline.common.updateBlocksCallback.success, timeline.common.updateBlocksCallback.failure );
    timeline.slider.toogleProgressBar();
};

// Update block callback method: callback for after we've fetched our blocks.
timeline.common.updateBlocksCallback =
{
    success: function( responseText )
    {
        try
        {
            if ( responseText != "" )
            {
                var blocks = JSON.parse( responseText );

                Object.keys( blocks ).forEach( function( index )
                {
                    var item = blocks[index];
                    // make sure all items are valid objects.
                    if ( item == undefined )
                        return;

                    var blockID = "address-" + item.objectid;
                    var xhtml = unescapeHTML( item.xhtml );

                    // Take care of double quotes ""
                    xhtml = xhtml.split( '&quot;' ).join( '"' );
                    // Take care of single quotes ''
                    xhtml = xhtml.split( '&#039;' ).join( "'" );

                    var myScripts = extractScripts( xhtml );

                    var node = document.getElementById( blockID );
                    node.innerHTML = xhtml;
                    // Scripts of the returned blocks: an external one (src) is loaded again; inline code is not run
                    // (a Content Security Policy forbids it, and the ezflow block templates have none)
                    myScripts.forEach( function( tag )
                    {
                        var src = tag.match( /\ssrc\s*=\s*["']([^"']+)["']/i );
                        if ( !src ) return;
                        var el = document.createElement( 'script' );
                        if ( /type\s*=\s*["']module["']/i.test( tag ) ) el.type = 'module';
                        el.src = src[1];
                        document.head.appendChild( el );
                    } );
                    // the new blocks are shown at once (no scroll-in reveal in a preview)
                    node.querySelectorAll( '[data-fx-reveal]' ).forEach( function( el ) { el.classList.add( 'is-in' ); } );

                    // If return xhtml contains <div id="address-..."> we need to remove it, if not
                    // we end up with double sets of <div id="address-..."> since we put the returned
                    // xhtml into the innerHTML of the existing <div id="address-..."> tag.

                    if ( node.childNodes[0] && node.childNodes[0].id == blockID )
                    {
                        node.innerHTML = node.firstChild.innerHTML;
                    }
                });
            }
        }
        finally
        {
            timeline.slider.toogleProgressBar();
        }
    },
    failure: function()
    {
        timeline.slider.toogleProgressBar();
        window.alert( "Timeline was unable to retrieve data from the server, please try again later..." );
    }
};

timeline.init = function()
{
    timeline.calendar.init();
    timeline.slider.init();
};

})( eZFlowTimeline );

/*
 * Templates without inline code: extra/timeline.tpl carries the settings above in data-ezflow-timeline (JSON: slider
 * and calendar, merged into eZFlowTimeline.slider / .calendar) and the timeline starts from them when the page is
 * ready, the way the inline script did. Set up once, however often this file is printed.
 */
( function( timeline )
{
    if ( timeline.dataSetup ) return;
    timeline.dataSetup = true;

    window.eZFlow.ready( function()
    {
        var box = document.querySelector( '[data-ezflow-timeline]' ), cfg;
        if ( !box ) return;
        try
        {
            cfg = JSON.parse( box.getAttribute( 'data-ezflow-timeline' ) );
        }
        catch ( e )
        {
            return;
        }
        Object.assign( timeline.slider, cfg.slider || {} );
        Object.assign( timeline.calendar, cfg.calendar || {} );
        timeline.init();
    } );
} )( eZFlowTimeline );
