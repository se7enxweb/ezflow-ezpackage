{ezscript_require( array( 'ezjsc::jquery', 'ezjsc::jqueryio', 'ezflow_blocks.js' ) )}

{def $valid_nodes = $block.valid_nodes}
<!-- BLOCK: START -->
{* The previous/next buttons load three items at a time (javascript/ezflow_blocks.js; no inline code). *}
<div id="block-{$block.id}" class="block-type-gallery" data-ezflow-carousel="{$block.id|wash}" data-total="{$valid_nodes|count()}">

<div class="border-box block-style6-box-outside">
<div class="border-tl"><div class="border-tr"><div class="border-tc"></div></div></div>
<div class="border-ml"><div class="border-mr"><div class="border-mc">
<div class="border-content">

<div class="block">
    <div class="left">
        <h2>{$block.name|wash()}</h2>
    </div>
    <div class="right">
        <input type="image" src={"input-img-prev.png"|ezimage()} class="carousel-prev-button" />
        <input type="image" src={"input-img-next.png"|ezimage()} class="carousel-next-button" />
    </div>
    <div class="break"></div>
</div>
<!-- BLOCK BORDER INSIDE: START -->

<div class="border-box block-style6-box-inside">
<div class="border-tl"><div class="border-tr"><div class="border-tc"></div></div></div>
<div class="border-ml"><div class="border-mr"><div class="border-mc">
<div class="border-content">

<!-- BLOCK CONTENT: START -->

<div class="columns-three">
<div class="col-1-2">
<div class="col-1">
<div class="col-content">

{node_view_gui view='block_item' image_class='blockgallery1' content_node=$valid_nodes[0]}

</div>
</div>
<div class="col-2">
<div class="col-content">

{node_view_gui view='block_item' image_class='blockgallery1' content_node=$valid_nodes[1]}

</div>
</div>
</div>
<div class="col-3">
<div class="col-content">

{node_view_gui view='block_item' image_class='blockgallery1' content_node=$valid_nodes[2]}

</div>
</div>
</div>

<!-- BLOCK CONTENT: END -->

</div>
</div></div></div>
<div class="border-bl"><div class="border-br"><div class="border-bc"></div></div></div>
</div>

<!-- BLOCK BORDER INSIDE: END -->

</div>
</div></div></div>
<div class="border-bl"><div class="border-br"><div class="border-bc"></div></div></div>
</div>

</div>
<!-- BLOCK: END -->

{undef $valid_nodes}