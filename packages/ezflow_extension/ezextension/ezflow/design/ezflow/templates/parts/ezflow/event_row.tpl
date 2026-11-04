{* One event in a list: date badge, title, time and category, its text. Parameter: event (a node). *}
{def $fx_e_from = $event.data_map.from_time.content.timestamp
     $fx_e_to   = cond( $event.data_map.to_time.has_content, $event.data_map.to_time.content.timestamp, 0 )}
<li class="fx-event" data-fx-reveal>
    <time class="fx-date" datetime="{$fx_e_from|datetime( 'custom', '%Y-%m-%d' )}"><span class="fx-date__month">{$fx_e_from|datetime( 'custom', '%M' )}</span><span class="fx-date__day">{$fx_e_from|datetime( 'custom', '%j' )}</span></time>
    <div>
        <h3 class="fx-event__title"><a href={$event.url_alias|ezurl}>{$event.data_map.title.content|wash}</a></h3>
        <p class="fx-meta">
            <span>{$fx_e_from|datetime( 'custom', '%l, %F %j, %Y' )}</span>
            <span>{$fx_e_from|datetime( 'custom', '%g:%i %A' )}{if $fx_e_to} – {if $fx_e_to|datetime( 'custom', '%Y%m%d' )|ne( $fx_e_from|datetime( 'custom', '%Y%m%d' ) )}{$fx_e_to|datetime( 'custom', '%F %j, ' )}{/if}{$fx_e_to|datetime( 'custom', '%g:%i %A' )}{/if} UTC</span>
            {if $event.data_map.category.has_content}<span class="fx-tag">{$event.data_map.category.content.keyword_string|wash}</span>{/if}
        </p>
        {if $event.data_map.text.has_content}<div class="fx-event__text">{attribute_view_gui attribute=$event.data_map.text}</div>{/if}
    </div>
</li>
{undef $fx_e_from $fx_e_to}
