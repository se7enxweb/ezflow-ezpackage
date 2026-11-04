{* The teaser image of a node as one <img>: the image of an image node, the related image of an article or gallery
   (or its own image attribute), else the first image the object embeds. Prints nothing without one.
   Parameters: node, alias (image alias, default fx_card), sizes (optional), eager (optional, true for the hero). *}
{def $fx_ti_alias = first_set( $alias, 'fx_card' )
     $fx_ti_attr  = false()
     $fx_ti_dm    = $node.data_map}
{if is_set( $fx_ti_dm.image )}
    {if eq( $fx_ti_dm.image.data_type_string, 'ezimage' )}
        {if $fx_ti_dm.image.has_content}{set $fx_ti_attr = $fx_ti_dm.image}{/if}
    {elseif and( eq( $fx_ti_dm.image.data_type_string, 'ezobjectrelation' ), $fx_ti_dm.image.has_content )}
        {if is_set( $fx_ti_dm.image.content.data_map.image )}{set $fx_ti_attr = $fx_ti_dm.image.content.data_map.image}{/if}
    {/if}
{/if}
{if $fx_ti_attr|not}
    {foreach fetch( 'content', 'related_objects', hash( 'object_id', $node.contentobject_id, 'all_relations', true(), 'limit', 3 ) ) as $fx_ti_rel}
        {if and( $fx_ti_attr|not, eq( $fx_ti_rel.class_identifier, 'image' ), $fx_ti_rel.data_map.image.has_content )}{set $fx_ti_attr = $fx_ti_rel.data_map.image}{/if}
    {/foreach}
{/if}
{if $fx_ti_attr}
    {def $fx_ti_img = $fx_ti_attr.content[$fx_ti_alias]
         $fx_ti_s   = $fx_ti_attr.content['fx_thumb']
         $fx_ti_m   = $fx_ti_attr.content['fx_card']
         $fx_ti_big = $fx_ti_attr.content['fx_wide']}
<img src={$fx_ti_img.url|ezroot} srcset="{$fx_ti_s.url|ezroot( 'no' )} {$fx_ti_s.width}w, {$fx_ti_m.url|ezroot( 'no' )} {$fx_ti_m.width}w, {$fx_ti_big.url|ezroot( 'no' )} {$fx_ti_big.width}w" sizes="{first_set( $sizes, '(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw' )}" width="{$fx_ti_img.width}" height="{$fx_ti_img.height}" alt="{$fx_ti_attr.content.alternative_text|wash}"{if first_set( $eager, false() )} fetchpriority="high"{else} loading="lazy"{/if} decoding="async">
    {undef $fx_ti_img $fx_ti_s $fx_ti_m $fx_ti_big}
{/if}
{undef $fx_ti_alias $fx_ti_attr $fx_ti_dm}
