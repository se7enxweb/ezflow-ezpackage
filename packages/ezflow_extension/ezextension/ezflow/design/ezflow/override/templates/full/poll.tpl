{* Poll: the description and the question as a form; the results are on content/collectedinfo. *}
{def $question_attribute = $node.data_map.question}
<div class="fx-container fx-article">
    <header class="fx-article__head">
        <p class="fx-kicker">{$node.class_name|wash}</p>
        <h1>{$node.name|wash}</h1>
        {if $node.data_map.description.has_content}<div class="fx-pagehead__lead">{attribute_view_gui attribute=$node.data_map.description}</div>{/if}
    </header>
    <div class="fx-poll">
    <form method="post" action={"content/action"|ezurl}>
        <input type="hidden" name="ContentNodeID" value="{$node.node_id}">
        <input type="hidden" name="ContentObjectID" value="{$node.contentobject_id}">
        <input type="hidden" name="ViewMode" value="full">
        <fieldset class="fx-poll__options">
            <legend class="fx-poll__question">{$question_attribute.content.name|wash}</legend>
            {foreach $question_attribute.content.option_list as $index => $option}
            <label class="fx-poll__option"><input type="radio" name="ContentObjectAttribute_data_option_value_{$question_attribute.id}" value="{$option.id}"{if eq( $index, 0 )} checked{/if}> {$option.value|wash}</label>
            {/foreach}
        </fieldset>
        <div class="fx-poll__actions">
            <button class="fx-btn" type="submit" name="ActionCollectInformation" value="1">{'Vote'|i18n( 'design/ezflow/embed/poll' )}</button>
            <a class="fx-link-arrow" href={concat( 'content/collectedinfo/', $node.node_id )|ezurl}>{'Poll results'|i18n( 'design/ezflow/block' )}</a>
        </div>
    </form>
    </div>
</div>
{undef $question_attribute}
