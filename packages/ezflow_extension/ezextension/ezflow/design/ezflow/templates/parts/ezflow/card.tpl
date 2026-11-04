{* One content card for blocks and listings. Parameters: node; variant (card, feature, row, flat; default card);
   level (heading level, default 3); alias (image alias); text (false() hides the teaser text); meta (true() shows
   the date); placeholder (false() hides the drawn placeholder of a node without image). *}
{def $fx_c_variant = first_set( $variant, 'card' )
     $fx_c_level   = first_set( $level, 3 )
     $fx_c_image   = ''}
{set-block variable=fx_c_image}{include uri='design:parts/ezflow/teaser_image.tpl' node=$node alias=first_set( $alias, 'fx_card' )}{/set-block}
<article class="fx-card fx-card--{$fx_c_variant}{if eq( $fx_c_variant, 'feature' )} fx-feature{/if}" data-fx-reveal>
    {if $fx_c_image|trim}
    <div class="fx-media">{$fx_c_image}</div>
    {elseif first_set( $placeholder, true() )}
    <div class="fx-media fx-media--placeholder" aria-hidden="true"><svg viewBox="0 0 48 48" width="96" height="96" focusable="false"><path d="M8 34l10-12 8 9 6-7 8 10z"/><circle cx="33" cy="16" r="4"/></svg></div>
    {/if}
    <div class="fx-card__body">
        <h{$fx_c_level} class="fx-card__title"><a href={$node.url_alias|ezurl}>{$node.name|wash}</a></h{$fx_c_level}>
        {if first_set( $text, true() )}
        <div class="fx-card__text">{include uri='design:parts/ezflow/teaser_text.tpl' node=$node}</div>
        {/if}
        {if first_set( $meta, false() )}
        <p class="fx-card__meta"><time datetime="{$node.object.published|datetime( 'custom', '%Y-%m-%d' )}">{$node.object.published|datetime( 'custom', '%F %j, %Y' )}</time></p>
        {/if}
    </div>
</article>
{undef $fx_c_variant $fx_c_level $fx_c_image}
