{* Flash player - Full view *}
<div class="border-box">
<div class="border-tl"><div class="border-tr"><div class="border-tc"></div></div></div>
<div class="border-ml"><div class="border-mr"><div class="border-mc float-break">

<div class="content-view-full">
    <div class="class-flash">

    <div class="attribute-header">
        <h1>{$node.name|wash()}</h1>
    <div>

    <div class="attribute-short">
        {attribute_view_gui attribute=$node.data_map.description}
    </div>

    <div class="content-media">
{def $siteurl=concat( "http://", ezini( 'SiteSettings', 'SiteURL' ) )
     $attribute_file=$node.data_map.file
     $video=concat( "content/download/",$attribute_file.contentobject_id,"/", $attribute_file.content.contentobject_attribute_id )|ezurl(no)
     $flash_var=concat( "moviepath=", $video )}

    {* Embed URL, which URL to retrieve the embed code from. *}
    {set $flash_var=$flash_var|append( "&amp;embedurl=", concat( $siteurl, "/flash/embed/", $node.object.id ) )}

    {* Embed Link *}
    {set $flash_var=$flash_var|append( "&amp;embedlink=", concat( $siteurl, $node.url_alias|ezurl(no) ) )}

    {* The player, printed directly (it was written by an inline script before; no inline code). *}
    <object type="application/x-shockwave-flash" data="{'flash/flash_player.swf'|ezdesign(no)}" width="448" height="354">
        <param name="movie" value="{'flash/flash_player.swf'|ezdesign(no)}" />
        <param name="scale" value="exactfit" />
        <param name="allowScriptAccess" value="sameDomain" />
        <param name="allowFullScreen" value="true" />
        <param name="flashvars" value="{$flash_var}" />
        <p>No <a href="http://www.macromedia.com/go/getflashplayer">Flash player</a> avaliable!</p>
    </object>
    </div>

    </div>
</div>
</div>
</div>

</div></div></div>
<div class="border-bl"><div class="border-br"><div class="border-bc"></div></div></div>
</div>