{* Event calendar: upcoming events first (date badge, time, category), then past events. *}
{def $fx_now = currentdate()
     $upcoming = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'class_filter_type', 'include', 'class_filter_array', array( 'event' ),
                                                 'attribute_filter', array( array( 'event/from_time', '>=', $fx_now|sub( 86400 ) ) ), 'sort_by', array( 'attribute', true(), 'event/from_time' ) ) )
     $past = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'class_filter_type', 'include', 'class_filter_array', array( 'event' ), 'limit', 10,
                                             'attribute_filter', array( array( 'event/from_time', '<', $fx_now|sub( 86400 ) ) ), 'sort_by', array( 'attribute', false(), 'event/from_time' ) ) )}
<div class="fx-container">
    <header class="fx-pagehead">
        <p class="fx-kicker">{'Calendar'|i18n( 'design/ezflow/full/event' )}</p>
        <h1>{$node.name|wash}</h1>
    </header>
    {if $upcoming|count}
    <ul class="fx-events">{foreach $upcoming as $event}{include uri='design:parts/ezflow/event_row.tpl' event=$event}{/foreach}</ul>
    {/if}
    {if $past|count}
    <h2 class="fx-section">{'Past events'|i18n( 'design/ezflow/full/event' )}</h2>
    <ul class="fx-events">{foreach $past as $event}{include uri='design:parts/ezflow/event_row.tpl' event=$event}{/foreach}</ul>
    {/if}
</div>
{undef $fx_now $upcoming $past}
