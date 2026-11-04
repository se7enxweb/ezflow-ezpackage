{* main_story1: the main story as a hero (split): the item's image, its name and teaser, a link to it. *}
{def $valid_node = $block.valid_nodes[0]}
{if $valid_node}
<section class="fx-block fx-block--hero">
<article class="fx-hero fx-hero--split" data-fx-reveal>
    <div class="fx-hero__media">{include uri='design:parts/ezflow/teaser_image.tpl' node=$valid_node alias='fx_card' sizes='(min-width: 1240px) 1240px, 100vw' eager=true()}</div>
    <div class="fx-hero__body">
        {if $block.name|trim}<p class="fx-kicker fx-hero__kicker">{$block.name|wash}</p>{/if}
        <h2 class="fx-hero__title"><a href={$valid_node.url_alias|ezurl}>{$valid_node.name|wash}</a></h2>
        <div class="fx-hero__text">{include uri='design:parts/ezflow/teaser_text.tpl' node=$valid_node}</div>
        <div class="fx-hero__actions">
            <a class="fx-btn" href={$valid_node.url_alias|ezurl}>{'Read more'|i18n( 'design/ezflow/block' )}<span class="fx-sr-only">: {$valid_node.name|wash}</span></a>
            {if $valid_node.parent.node_id|ne( 2 )}<a class="fx-btn fx-btn--ghost" href={$valid_node.parent.url_alias|ezurl}>{$valid_node.parent.name|wash}</a>{/if}
        </div>
    </div>
</article>
</section>
{/if}
{undef $valid_node}
