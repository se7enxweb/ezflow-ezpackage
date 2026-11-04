{* online_users: how many users are signed in; the number refreshes every minute (javascript/ezflow-site.js, through
   ezjscore's ezflow::onlineusers). *}
{def $logged_in_count = fetch( 'user', 'logged_in_count' )}
<section class="fx-block fx-block--compact fx-panel" aria-labelledby="fx-b-{$block.id}" data-fx-online data-fx-url={"ezjscore/call/ezflow::onlineusers"|ezurl}>
    <header class="fx-block__head"><h2 class="fx-block__title" id="fx-b-{$block.id}">{$block.name|wash}</h2></header>
    <p class="fx-stat"><span data-fx-online-count>{$logged_in_count}</span><small>{'There are currently %logged_in_count active users on the system.'|i18n( 'design/ezflow/block/online_users', , hash( '%logged_in_count', $logged_in_count ) )}</small></p>
</section>
{undef $logged_in_count}
