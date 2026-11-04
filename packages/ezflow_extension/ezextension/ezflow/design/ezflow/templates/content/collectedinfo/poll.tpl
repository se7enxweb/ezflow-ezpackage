{* The results of a poll: one bar (<progress>) per option, with its share and its number of votes. *}
{set-block scope=global variable=title}{'Poll %pollname'|i18n( 'design/ezwebin/collectedinfo/poll', , hash( '%pollname', $node.name|wash() ) )}{/set-block}
<div class="fx-container fx-article">
    <header class="fx-article__head">
        <p class="fx-kicker">{'Results'|i18n( 'design/ezwebin/collectedinfo/poll' )}</p>
        <h1>{$node.name|wash}</h1>
    </header>
    {if $error}
        {if $error_anonymous_user}<p class="warning">{'Please log in to vote on this poll.'|i18n( 'design/ezwebin/collectedinfo/poll' )}</p>{/if}
        {if $error_existing_data}<p class="warning">{'You have already voted for this poll.'|i18n( 'design/ezwebin/collectedinfo/poll' )}</p>{/if}
    {/if}
    <div class="fx-poll">
    {foreach $object.contentobject_attributes as $contentobject_attribute_item}
        {if $contentobject_attribute_item.contentclass_attribute.is_information_collector}
        {def $contentobject_attribute_id = $contentobject_attribute_item.id
             $total_count = fetch( 'content', 'collected_info_count', hash( 'object_attribute_id', $contentobject_attribute_id ) )
             $item_counts = fetch( 'content', 'collected_info_count_list', hash( 'object_attribute_id', $contentobject_attribute_id ) )}
        <h2 class="fx-poll__question">{$contentobject_attribute_item.content.name|wash}</h2>
        <ul class="fx-results">
        {foreach $contentobject_attribute_item.content.option_list as $option}
            {def $item_count = first_set( $item_counts[$option.id], 0 )
                 $percentage = cond( $total_count|gt( 0 ), round( div( mul( $item_count, 100 ), $total_count ) ), 0 )}
            <li class="fx-results__row">
                <span class="fx-results__label"><span id="fx-opt-{$option.id}">{$option.value|wash}</span><span>{$percentage}%</span></span>
                <progress class="fx-results__bar" max="100" value="{$percentage}" aria-labelledby="fx-opt-{$option.id}">{$percentage}%</progress>
                <span class="fx-meta"><span>{'Votes'|i18n( 'design/ezwebin/collectedinfo/poll' )}: {$item_count}</span></span>
            </li>
            {undef $item_count $percentage}
        {/foreach}
        </ul>
        <p class="fx-meta"><span>{'%count total votes'|i18n( 'design/standard/content/poll', , hash( '%count', $total_count ) )}</span></p>
        {undef $contentobject_attribute_id $total_count $item_counts}
        {/if}
    {/foreach}
    </div>
    <p><a class="fx-link-arrow" href={$node.url_alias|ezurl}>{$node.name|wash}</a></p>
</div>
