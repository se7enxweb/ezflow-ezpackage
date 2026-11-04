{* The site header: brand, the main menu (the first level below the root node), search, the theme switch and the
   visitor's links. On narrow screens the menu folds behind a button (javascript/ezflow-site.js). *}
{def $fx_root  = fetch( 'content', 'node', hash( 'node_id', $pagedata.root_node ) )
     $fx_menu  = fetch( 'content', 'list', hash( 'parent_node_id', $pagedata.root_node,
                                                 'sort_by', $fx_root.sort_array,
                                                 'class_filter_type', 'include',
                                                 'class_filter_array', ezini( 'MenuContentSettings', 'TopIdentifierList', 'menu.ini' )|merge( array( 'frontpage', 'folder', 'blog', 'event_calendar', 'gallery', 'feedback_form', 'forums', 'link' ) )|unique() ) )
     $fx_in_path = first_set( $pagedata.path_array[1].node_id, 0 )}
<header class="fx-header" data-fx-header>
  <div class="fx-header__bar fx-container">
    <a class="fx-brand" href={"/"|ezurl} rel="home">
      {if $pagedesign.data_map.image.content.is_valid}
        <img class="fx-brand__logo" src={$pagedesign.data_map.image.content[original].full_path|ezroot} alt="{ezini( 'SiteSettings', 'SiteName' )|wash}" width="{$pagedesign.data_map.image.content[original].width}" height="{$pagedesign.data_map.image.content[original].height}">
      {else}
        <svg class="fx-brand__mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><path d="M6 6h20v4H11v4h12v4H11v4h15v4H6z"/></svg>
        <span class="fx-brand__name">{ezini( 'SiteSettings', 'SiteName' )|wash}</span>
      {/if}
    </a>

    <button class="fx-iconbtn fx-menu-toggle" type="button" aria-expanded="false" aria-controls="fx-nav" data-fx-menu-toggle>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      <span class="fx-sr-only">{'Menu'|i18n( 'design/ezflow/pagelayout' )}</span>
    </button>

    <div class="fx-nav" id="fx-nav" data-fx-nav>
      <nav aria-label="{'Main'|i18n( 'design/ezflow/pagelayout' )}">
        <ul class="fx-nav__list">
        {foreach $fx_menu as $fx_item}
          {if eq( $fx_item.class_identifier, 'link' )}
          <li><a class="fx-nav__link" href={$fx_item.data_map.location.content|ezurl}>{$fx_item.name|wash}</a></li>
          {else}
          <li><a class="fx-nav__link{if $fx_in_path|eq( $fx_item.node_id )} is-active{/if}" href={$fx_item.url_alias|ezurl}{if $fx_item.node_id|eq( $current_node_id )} aria-current="page"{/if}>{$fx_item.name|wash}</a></li>
          {/if}
        {/foreach}
        </ul>
      </nav>

      <form class="fx-search" role="search" method="post" action={"/content/search"|ezurl}>
        <label class="fx-sr-only" for="fx-search-text">{'Search text:'|i18n( 'design/ezflow/pagelayout' )}</label>
        <input id="fx-search-text" class="fx-search__input" name="SearchText" type="search" placeholder="{'Search'|i18n( 'design/ezflow/pagelayout' )}"{if $pagedata.is_edit} disabled{/if}>
        {include uri='design:parts/front_search_suggest.tpl'}
        {if eq( $ui_context, 'browse' )}<input name="Mode" type="hidden" value="browse">{/if}
        <button class="fx-iconbtn fx-search__go" type="submit"{if $pagedata.is_edit} disabled{/if}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <span class="fx-sr-only">{'Search'|i18n( 'design/ezflow/pagelayout' )}</span>
        </button>
      </form>

      <ul class="fx-userlinks">
        {if $basket_is_empty|not()}
        <li><a href={"/shop/basket/"|ezurl}>{$pagedesign.data_map.shopping_basket_label.data_text|wash}</a></li>
        {/if}
        {if $current_user.is_logged_in}
          {if $pagedesign.data_map.my_profile_label.has_content}
          <li><a href={"/user/edit/"|ezurl}>{$pagedesign.data_map.my_profile_label.data_text|wash}</a></li>
          {/if}
          <li><a href={"/user/logout"|ezurl}>{cond( $pagedesign.data_map.logout_label.has_content, $pagedesign.data_map.logout_label.data_text, 'Sign out'|i18n( 'design/ezflow/pagelayout' ) )|wash}</a></li>
        {else}
          {if and( $pagedesign.data_map.register_user_label.has_content, ezmodule( 'user/register' ) )}
          <li><a href={"/user/register"|ezurl}>{$pagedesign.data_map.register_user_label.data_text|wash}</a></li>
          {/if}
          <li><a class="fx-btn fx-btn--small" href={"/user/login"|ezurl}>{cond( $pagedesign.data_map.login_label.has_content, $pagedesign.data_map.login_label.data_text, 'Sign in'|i18n( 'design/ezflow/pagelayout' ) )|wash}</a></li>
        {/if}
        {if $pagedesign.can_edit}
        <li><a href={concat( "/content/edit/", $pagedesign.id, "/a" )|ezurl}>{$pagedesign.data_map.site_settings_label.data_text|wash}</a></li>
        {/if}
      </ul>
    </div>

    <button class="fx-iconbtn fx-theme-toggle" type="button" data-fx-theme-toggle
            data-label-auto="{'Automatic'|i18n( 'design/ezflow/pagelayout' )}"
            data-label-light="{'Light mode'|i18n( 'design/ezflow/pagelayout' )}"
            data-label-dark="{'Dark mode'|i18n( 'design/ezflow/pagelayout' )}">
      <svg class="fx-theme-toggle__sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <svg class="fx-theme-toggle__moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
      <span class="fx-sr-only" data-fx-theme-label>{'Automatic'|i18n( 'design/ezflow/pagelayout' )}</span>
    </button>
  </div>
</header>
{undef $fx_root $fx_menu $fx_in_path}
