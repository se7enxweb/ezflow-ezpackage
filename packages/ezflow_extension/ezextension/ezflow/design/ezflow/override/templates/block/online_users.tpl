{* The count is refreshed through ezjscore by javascript/ezflow_blocks.js (no inline code). *}
<div class="block-type-online-users block-view-{$block.view}" data-ezflow-online-users="{$block.id|wash}">

<div class="attribute-header"><h2>{$block.name|wash()}</h2></div>

{def $logged_in_count = fetch( 'user', 'logged_in_count' )}
{'There are currently %logged_in_count active users on the system.'|i18n( 'design/ezflow/block/online_users', , hash( '%logged_in_count', concat( '<span id="logged-in-count-', $block.id, '">', $logged_in_count, '</span>' ) ) )}

{* Disabled as of 4.4 as it doesn't work with default session handler (file) *}
<!-- br / -->
{* def $anonymous_count = fetch( 'user', 'anonymous_count' )}
{'There are %anonymous_count anonymous users accessing the site.'|i18n( 'design/ezflow/block/online_users', , hash( '%anonymous_count', concat( '<span id="anonymous-count-', $block.id, '">', $anonymous_count, '</span>' ) ) )*}

</div>

{ezscript_require( array( 'ezjsc::jquery', 'ezjsc::jqueryio', 'ezflow_blocks.js' ) )}
{undef $logged_in_count}
