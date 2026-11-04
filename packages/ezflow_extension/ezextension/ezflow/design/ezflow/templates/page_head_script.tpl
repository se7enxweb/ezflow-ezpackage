{* The design's module (menus, theme switch, galleries, carousels, motion), loaded as an ES module through the packer;
   then the scripts other extensions list, deferred (in order, after the page is parsed, never blocking it).
   No inline code. *}
{foreach ezscriptfiles( array( 'ezflow-site.js' ), 3 ) as $fx_src}
<script type="module" src="{$fx_src}"></script>
{/foreach}
{* FrontendJavaScriptList holds the editing scripts of extensions (eztags' tag editor ...): only for signed-in users *}
{foreach ezscriptfiles( cond( $current_user.is_logged_in, array( ezini( 'JavaScriptSettings', 'JavaScriptList', 'design.ini' ), ezini( 'JavaScriptSettings', 'FrontendJavaScriptList', 'design.ini' ) ), array( ezini( 'JavaScriptSettings', 'JavaScriptList', 'design.ini' ) ) ), 3 ) as $fx_src}{if $fx_src|trim|not}{continue}{/if}
<script src="{$fx_src}" defer></script>
{/foreach}
