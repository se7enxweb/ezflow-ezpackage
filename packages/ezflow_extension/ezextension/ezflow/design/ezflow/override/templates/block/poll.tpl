{* poll: the poll the block names (custom attribute poll_node_id) as a form; votes go through information collection
   (content/action), the results page is content/collectedinfo. *}
{def $poll_node = fetch( 'content', 'node', hash( 'node_id', $block.custom_attributes.poll_node_id ) )}
{if and( $poll_node, is_set( $poll_node.data_map.question ) )}
{def $question_attribute = $poll_node.data_map.question}
<section class="fx-block fx-block--poll" aria-labelledby="fx-b-{$block.id}">
<div class="fx-poll" data-fx-reveal>
    <p class="fx-kicker" id="fx-b-{$block.id}">{cond( $block.name|trim, $block.name, $poll_node.class_name )|wash}</p>
    <form method="post" action={"content/action"|ezurl}>
        <input type="hidden" name="ContentNodeID" value="{$poll_node.node_id}">
        <input type="hidden" name="ContentObjectID" value="{$poll_node.contentobject_id}">
        <input type="hidden" name="ViewMode" value="full">
        <fieldset class="fx-poll__options">
            <legend class="fx-poll__question">{$question_attribute.content.name|wash}</legend>
            {foreach $question_attribute.content.option_list as $index => $option}
            <label class="fx-poll__option"><input type="radio" name="ContentObjectAttribute_data_option_value_{$question_attribute.id}" value="{$option.id}"{if eq( $index, 0 )} checked{/if}> {$option.value|wash}</label>
            {/foreach}
        </fieldset>
        <div class="fx-poll__actions">
            <button class="fx-btn" type="submit" name="ActionCollectInformation" value="1">{'Vote'|i18n( 'design/ezflow/embed/poll' )}</button>
            <a class="fx-link-arrow" href={concat( 'content/collectedinfo/', $poll_node.node_id )|ezurl}>{'Poll results'|i18n( 'design/ezflow/block' )}</a>
        </div>
    </form>
</div>
</section>
{undef $question_attribute}
{/if}
{undef $poll_node}
