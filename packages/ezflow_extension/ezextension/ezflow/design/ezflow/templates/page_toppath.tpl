<nav class="fx-crumbs fx-container" aria-label="{'Breadcrumb'|i18n( 'design/ezflow/pagelayout' )}">
  <ol>
  {foreach $pagedata.path_array as $fx_i => $fx_crumb}
    {if $fx_crumb.url}
      <li><a href={cond( is_set( $fx_crumb.url_alias ), $fx_crumb.url_alias, $fx_crumb.url )|ezurl}>{$fx_crumb.text|wash}</a></li>
    {else}
      <li aria-current="page">{$fx_crumb.text|wash}</li>
    {/if}
  {/foreach}
  </ol>
</nav>
