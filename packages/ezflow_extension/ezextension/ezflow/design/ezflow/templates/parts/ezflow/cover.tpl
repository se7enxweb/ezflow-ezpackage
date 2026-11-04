{* The cover of a full view: the teaser image, large, with the image's caption (its credit) below. Parameter: node. *}
{def $fx_cv_img = ''
     $fx_cv_obj = false()}
{set-block variable=fx_cv_img}{include uri='design:parts/ezflow/teaser_image.tpl' node=$node alias='fx_wide' sizes='(min-width: 1240px) 1240px, 100vw' eager=true()}{/set-block}
{if $fx_cv_img|trim}
    {if and( is_set( $node.data_map.image ), eq( $node.data_map.image.data_type_string, 'ezobjectrelation' ), $node.data_map.image.has_content )}{set $fx_cv_obj = $node.data_map.image.content}{/if}
<figure class="fx-article__cover">
    <div class="fx-media">{$fx_cv_img}</div>
    {if and( $fx_cv_obj, is_set( $fx_cv_obj.data_map.caption ), $fx_cv_obj.data_map.caption.has_content )}<figcaption>{attribute_view_gui attribute=$fx_cv_obj.data_map.caption}</figcaption>{/if}
</figure>
{/if}
{undef $fx_cv_img $fx_cv_obj}
