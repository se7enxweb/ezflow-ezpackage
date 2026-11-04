{* The comments below an article or post, and the form link to write one (content/action, class comment). *}
{def $fx_comments = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'class_filter_type', 'include', 'class_filter_array', array( 'comment' ), 'sort_by', array( 'published', true() ) ) )}
<section class="fx-section" aria-labelledby="fx-comments">
    <h2 id="fx-comments">{'Comments'|i18n( 'design/ezflow/full/article' )}</h2>
    {foreach $fx_comments as $fx_comment}
    <article class="fx-panel">
        <h3>{$fx_comment.data_map.subject.content|wash}</h3>
        <p class="fx-meta"><span>{$fx_comment.data_map.author.content|wash}</span><time>{$fx_comment.object.published|l10n( 'shortdatetime' )}</time></p>
        <p>{$fx_comment.data_map.message.content|wash( xhtml )|nl2br}</p>
    </article>
    {/foreach}
    {if fetch( 'content', 'access', hash( 'access', 'create', 'contentobject', $node, 'contentclass_id', 'comment' ) )}
    <form method="post" action={"content/action"|ezurl}>
        <input type="hidden" name="ClassIdentifier" value="comment">
        <input type="hidden" name="NodeID" value="{$node.object.main_node.node_id}">
        <input type="hidden" name="ContentLanguageCode" value="{ezini( 'RegionalSettings', 'ContentObjectLocale', 'site.ini' )}">
        <button class="fx-btn fx-btn--ghost" type="submit" name="NewButton" value="1">{'New comment'|i18n( 'design/ezflow/full/article' )}</button>
    </form>
    {/if}
</section>
{undef $fx_comments}
