<!DOCTYPE html>
<html lang="{$site.http_equiv.Content-language|wash}" class="fx-no-js">
<head>
{def $basket_is_empty   = cond( $current_user.is_logged_in, fetch( shop, basket ).is_empty, 1 )
     $user_hash         = concat( $current_user.role_id_list|implode( ',' ), ',', $current_user.limited_assignment_value_list|implode( ',' ) )}

{* The old per-user display styles (an inline style block) are not used by this design. *}

{if is_set( $extra_cache_key )|not}
    {def $extra_cache_key = ''}
{/if}
{* Error pages can arrive with the same URI while their title and path name the error: key them by error type and
   number too (every other page keeps the plain URI key) *}
{def $uri_cache_key = $module_result.uri}
{if is_set( $module_result.errorType )}
{set $uri_cache_key = concat( $module_result.uri, '|error|', $module_result.errorType, '|', first_set( $module_result.errorNumber, '' ) )}
{/if}

{cache-block keys=array( $uri_cache_key, $basket_is_empty, $current_user.contentobject_id, $extra_cache_key )}
{def $pagedata         = ezpagedata()
     $pagestyle        = $pagedata.css_classes
     $locales          = fetch( 'content', 'translation_list' )
     $pagedesign       = $pagedata.template_look
     $current_node_id  = $pagedata.node_id}

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
{include uri='design:page_head.tpl'}
{include uri='design:page_head_style.tpl'}
{include uri='design:page_head_script.tpl'}

</head>
<body class="fx-body {$pagestyle}">
<a class="fx-skip" href="#fx-main">{'Skip to main content'|i18n( 'design/ezflow/pagelayout' )}</a>

  {if and( is_set( $pagedata.persistent_variable.extra_template_list ),
             $pagedata.persistent_variable.extra_template_list|count() )}
    {foreach $pagedata.persistent_variable.extra_template_list as $extra_template}
      {include uri=concat( 'design:extra/', $extra_template )}
    {/foreach}
  {/if}

  {include uri='design:page_header.tpl'}

  {cache-block keys=array( $uri_cache_key, $user_hash, $extra_cache_key )}

  {if and( or( $pagedata.website_toolbar, $current_user.is_logged_in ), $pagedata.is_edit|not )}
    {include uri='design:page_toolbar.tpl'}
  {/if}

  {if and( $pagedata.show_path, $pagedata.path_array|count()|gt( 1 ) )}
    {include uri='design:page_toppath.tpl'}
  {/if}

  {/cache-block}
{/cache-block}

  <main id="fx-main" class="fx-main" tabindex="-1">
    {$module_result.content}
  </main>

{cache-block keys=array( $uri_cache_key, $user_hash, $access_type.name, $extra_cache_key )}
    {if is_unset( $pagedesign )}
        {def $pagedata   = ezpagedata()
             $pagedesign = $pagedata.template_look}
    {/if}

  {include uri='design:page_footer.tpl'}

{include uri='design:page_footer_script.tpl'}
{/cache-block}

{include uri='design:pagelayout/hooks/body_end.tpl'}
<!--DEBUG_REPORT-->
</body>
</html>
