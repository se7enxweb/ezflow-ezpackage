{* The page tools of an editor: expwt's page toolbar (it draws nothing where the website sidebar is on), and the
   ezflow tools the website toolbar had: the timeline of a frontpage and "Push to block" (ezflow/timeline,
   ezflow/push; their policies decide). *}
{def $fx_tb_node = fetch( 'content', 'node', hash( 'node_id', $current_node_id ) )}
<div class="fx-toolbar fx-container">
{include uri='design:parts/expwt_page_toolbar.tpl' current_node=$fx_tb_node}
{if $fx_tb_node}
    {def $fx_tb_timeline = and( ezini( 'TimelineSettings', 'AvailableForClasses', 'timeline.ini' )|contains( $fx_tb_node.class_identifier ), fetch( 'user', 'has_access_to', hash( 'module', 'ezflow', 'function', 'timeline' ) ) )
         $fx_tb_push     = and( $fx_tb_node.can_edit, fetch( 'user', 'has_access_to', hash( 'module', 'ezflow', 'function', 'edit' ) ) )}
    {if or( $fx_tb_timeline, $fx_tb_push )}
    <nav class="fx-pagetools" aria-label="ezflow">
        {if $fx_tb_timeline}<a class="fx-btn fx-btn--ghost fx-btn--small" href={concat( '/ezflow/timeline/', $fx_tb_node.node_id )|ezurl}>{'Timeline'|i18n( 'design/ezflow/parts/website_toolbar' )}</a>{/if}
        {if $fx_tb_push}<a class="fx-btn fx-btn--ghost fx-btn--small" href={concat( '/ezflow/push/', $fx_tb_node.node_id )|ezurl}>{'Push to block'|i18n( 'design/ezflow/parts/website_toolbar' )}</a>{/if}
    </nav>
    {/if}
    {undef $fx_tb_timeline $fx_tb_push}
{/if}
</div>
{undef $fx_tb_node}
