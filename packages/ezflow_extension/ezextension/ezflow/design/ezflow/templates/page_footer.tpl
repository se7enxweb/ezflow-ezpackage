{* The site footer: what the site is, its sections, the project's links, the footer text of the site settings. *}
{def $fx_f_root = fetch( 'content', 'node', hash( 'node_id', $pagedata.root_node ) )
     $fx_f_menu = fetch( 'content', 'list', hash( 'parent_node_id', $pagedata.root_node, 'sort_by', $fx_f_root.sort_array, 'limit', 8,
                                                  'class_filter_type', 'include', 'class_filter_array', array( 'frontpage', 'folder', 'blog', 'event_calendar', 'gallery', 'feedback_form' ) ) )}
<footer class="fx-footer">
  <div class="fx-container fx-footer__grid">
    <div>
      <p class="fx-footer__lead">{ezini( 'SiteSettings', 'SiteName' )|wash}</p>
      <p>{ezini( 'SiteSettings', 'SiteDescription' )|wash}</p>
    </div>
    <nav aria-labelledby="fx-f-sections">
      <h2 id="fx-f-sections">{'Sections'|i18n( 'design/ezflow/pagelayout' )}</h2>
      <ul>
      {foreach $fx_f_menu as $fx_f_item}<li><a href={$fx_f_item.url_alias|ezurl}>{$fx_f_item.name|wash}</a></li>{/foreach}
      </ul>
    </nav>
    <nav aria-labelledby="fx-f-project">
      <h2 id="fx-f-project">Exponential</h2>
      <ul>
        <li><a href="https://exponential.earth">exponential.earth</a></li>
        <li><a href="https://doc.exponential.earth">{'Documentation'|i18n( 'design/ezflow/pagelayout' )}</a></li>
        <li><a href="https://github.com/se7enxweb">GitHub</a></li>
        <li><a href="https://se7enx.com">7x</a></li>
      </ul>
    </nav>
    <nav aria-labelledby="fx-f-site">
      <h2 id="fx-f-site">{'This site'|i18n( 'design/ezflow/pagelayout' )}</h2>
      <ul>
        <li><a href={concat( "/content/view/sitemap/", $pagedata.root_node )|ezurl}>{'Site map'|i18n( 'design/ezflow/pagelayout' )}</a></li>
        <li><a href={concat( "/content/view/tagcloud/", $pagedata.root_node )|ezurl}>{'Tag cloud'|i18n( 'design/ezflow/pagelayout' )}</a></li>
        <li><a href={"/rss/feed/my_feed"|ezurl}>RSS</a></li>
        <li><a href={"/ezinfo/copyright"|ezurl}>{'Copyright'|i18n( 'design/ezflow/pagelayout' )}</a></li>
      </ul>
    </nav>
  </div>
  <div class="fx-container fx-footer__base">
    <address>
      {if $pagedesign.data_map.footer_text.has_content}{$pagedesign.data_map.footer_text.content|wash}{/if}
    </address>
    {if $pagedesign.data_map.hide_powered_by.data_int|not}
    <p>{'Powered by'|i18n( 'design/ezflow/pagelayout' )} <a href="https://exponential.earth">Exponential</a></p>
    {/if}
  </div>
</footer>
{undef $fx_f_root $fx_f_menu}
