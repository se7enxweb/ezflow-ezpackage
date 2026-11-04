{* One photo tile (gallery, carousel) as a list item: a link to the image node, with the large version for the
   lightbox in data attributes. Parameter: node (an image, or any node with a teaser image). *}
{def $fx_t_attr = cond( and( is_set( $node.data_map.image ), eq( $node.data_map.image.data_type_string, 'ezimage' ) ), $node.data_map.image, false() )}
<li data-fx-reveal>
    <a class="fx-tile" href={$node.url_alias|ezurl}{if $fx_t_attr} data-fx-large={$fx_t_attr.content['fx_wide'].url|ezroot} data-fx-alt="{$fx_t_attr.content.alternative_text|wash}" data-fx-caption="{$node.name|wash}"{/if}>
        {include uri='design:parts/ezflow/teaser_image.tpl' node=$node alias='fx_card' sizes='(min-width: 900px) 25vw, (min-width: 600px) 50vw, 100vw' eager=first_set( $eager, false() )}
        <span class="fx-tile__label">{$node.name|wash}</span>
    </a>
</li>
{undef $fx_t_attr}
