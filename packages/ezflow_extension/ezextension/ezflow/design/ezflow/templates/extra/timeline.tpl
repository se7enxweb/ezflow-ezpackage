{def $past_precision_hours=2 
     $past_filler_hours=4
     $past_precision_position_px=92
     $one_hour_in_px=80
     $slide_labels_spacing=80
     $slide_label_inital_spacing=-7
     $now_precise=currentdate()
     $now=sub( $now_precise, mul( $now_precise|datetime( 'custom', '%i' )|int, 60 ), $now_precise|datetime( 'custom', '%s' )|int )
     $past_start=$now|sub( sum( $past_filler_hours, $past_precision_hours )|mul( 3600 ) )}

{def $two_hours_in_past_timestamp=sub( $now, mul( $past_precision_hours, 3600 ) )
     $diff=$now_precise|sub( $two_hours_in_past_timestamp )
     $now_in_pixels=sum( mul( div( $one_hour_in_px, 3600 ), $diff ), $past_precision_position_px )}
{set $now_in_pixels=$now_in_pixels|sum( $slide_label_inital_spacing )}


{* The settings of the timeline, read by javascript/timeline/timeline.js when the page is ready (no inline code). *}
<div id="ezflow-timeline" data-ezflow-timeline="{json_encode( hash( 'slider', hash( 'initalSliderPosition', sum( $now_in_pixels, $slide_label_inital_spacing ),
                                                                                    'slideLabelInitalSpacing', $slide_label_inital_spacing,
                                                                                    'middeStartPx', 80,
                                                                                    'rightStartPx', 640,
                                                                                    'timestampStart', $past_start,
                                                                                    'timeStartHours', $past_start|datetime( 'custom', '%H' )|int,
                                                                                    'timeStartMinutes', $past_start|datetime( 'custom', '%i' )|int,
                                                                                    'nodeid', $node.node_id,
                                                                                    'fetchURL', '/ezflow/preview'|ezurl( 'no' ) ),
                                                                    'calendar', hash( 'arrowImageUP', concat( 'url(', 'timeline/arrow_up.gif'|ezimage( 'no' ), ')' ),
                                                                                      'arrowImageDown', concat( 'url(', 'timeline/arrow_down.gif'|ezimage( 'no' ), ')' ) ) ) )|wash}">

    <div id="timeline-loader">
        <p><span class="text">Loading, please wait...</span><img src={"timeline/loading.gif"|ezimage} alt="Loading" title="Loading" /></p>
    </div>

    <div id="date_selecter"><span id="show_calendar">{$now_precise|l10n( 'date' )}</span></div>

    <div id="cal1Container"></div> 

    <div id="slider-container">
        <div class="slider-labels">
            <span style="left: {$now_in_pixels}px" class="ticker_label" id="scrubbing-time">{$now_precise|datetime( 'custom', '%H:%i')}</span>
        </div>

        <div id="slider-bg">
            <div id="slider-thumb"><img src={"timeline/thumb-n.gif"|ezimage}></div>
        </div>

        {def $timestamp=$past_start
             $spacing=$slide_label_inital_spacing}

        <div class="slider-labels">
        {* Generate time labels with low precision (1 hour = 1 tick) *}    
            {for 0 to 1 as $counter}
                {if $counter|ne(0)}
                    {set $timestamp=$timestamp|sum( mul( $counter, mul( 4, 3600 ) ) )}            
                {/if}
                {set $spacing=$counter|mul( $slide_labels_spacing )}
                {set $spacing=$spacing|sum( $slide_label_inital_spacing )}
                <span style="left: {$spacing}px" class="ticker_label">{$timestamp|datetime( 'custom', '%H:%i' )}</span>
            {/for}
        
            {* Generate time labels with hight precision (1 hour = 4 ticks) *}    
            {for 2 to 8 as $counter}
                {set $timestamp=$timestamp|sum( $counter, 3600 )}
                {set $spacing=$counter|mul($slide_labels_spacing)}
                {set $spacing=$spacing|sum($slide_label_inital_spacing)}
                <span style="left: {$spacing}px" class="ticker_label">{$timestamp|datetime( 'custom', '%H:%i'  )}</span>
            {/for}    
        
            {* Generate time labels with low precision (1 hour = 1 tick) *}    
            {for 9 to 11 as $counter}
                {set $timestamp=$timestamp|sum( mul( 4, 3600 ) )}
                {set $spacing=$counter|mul($slide_labels_spacing)}
                {set $spacing=$spacing|sum($slide_label_inital_spacing)}
            
                <span class="timestamp">{$timestamp}</span>
                <span style="left: {$spacing}px" class="ticker_label">{$timestamp|datetime( 'custom', '%H:%i' )}</span>
            {/for}    
        </div>
    </div>
</div>

{ezscript_require( array( 'ezjsc::jquery', 'ezflowcalendar.js', 'timeline/timeline.js' ) )}
{ezcss_require( array( 'ezflowwidgets.css', 'timeline/timeline.css' ) )}
