{* The eZ Flow item of the content tree's context menu; it opens the submenu of node/ezflcontextsubmenu.tpl.
   No inline code: javascript/ezflow_menu.js registers the submenu in menuArray and opens it when the item is
   pointed at (data-ezflow-submenu). *}
{ezscript( array( 'ezflow_menu.js' ) )}

<hr />

<a id="menu-ezflow" class="more" href="#" data-ezflow-submenu="eZFlow">{'eZ Flow'|i18n( 'design/admin/node/contextmenu' )}</a>
