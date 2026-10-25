{* The eZ Flow submenu of the context menus (depth 1). No inline code: javascript/ezflow_menu.js puts it and the
   URL of its entry in menuArray and calls ezpopmenu_mouseOver() when the entry is pointed at. *}
<div class="popupmenu" id="eZFlow" data-ezflow-menu-depth="1">
    <a id="push-to-block" href="#" data-ezflow-menu="eZFlow" data-ezflow-menu-url="{'/ezflow/push/%nodeID%'|ezurl( 'no' )|wash}">{"Add to block in frontpage"|i18n("design/admin/contextsubmenu")}</a>
</div>
