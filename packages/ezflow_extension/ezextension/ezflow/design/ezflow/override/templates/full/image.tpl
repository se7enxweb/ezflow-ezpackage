{* Image: the picture, its caption and credit, and the next and previous image of its gallery. *}
{def $fx_img = $node.data_map.image.content}
<figure class="fx-container fx-article fx-image-full">
    <img src={$fx_img['fx_wide'].url|ezroot} width="{$fx_img['fx_wide'].width}" height="{$fx_img['fx_wide'].height}" alt="{$fx_img.alternative_text|wash}" fetchpriority="high">
    <figcaption class="fx-article__head fx-section">
        <h1>{$node.name|wash}</h1>
        {if $node.data_map.caption.has_content}<div class="fx-caption">{attribute_view_gui attribute=$node.data_map.caption}</div>{/if}
        <p><a class="fx-link-arrow" href={$node.parent.url_alias|ezurl}>{$node.parent.name|wash}</a></p>
    </figcaption>
</figure>
{undef $fx_img}
