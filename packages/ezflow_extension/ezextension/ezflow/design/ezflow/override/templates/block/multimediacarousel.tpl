{* multimediacarousel: the newest images of the block's source on a scroll-snap track; previous / next buttons
   (javascript/ezflow-site.js) and arrow keys move it, and it scrolls by touch or trackpad without JavaScript. *}
{def $valid_nodes = $block.valid_nodes}
<section class="fx-block fx-block--carousel fx-carousel" data-fx-carousel{if $block.name|trim} aria-labelledby="fx-b-{$block.id}"{/if}>
    <header class="fx-block__head">
        {if $block.name|trim}<h2 class="fx-block__title" id="fx-b-{$block.id}">{$block.name|wash}</h2>{/if}
        <div class="fx-carousel__nav">
            <button class="fx-iconbtn" type="button" data-fx-prev><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M15 18l-6-6 6-6"/></svg><span class="fx-sr-only">{'Previous'|i18n( 'design/ezflow/block' )}</span></button>
            <button class="fx-iconbtn" type="button" data-fx-next><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M9 18l6-6-6-6"/></svg><span class="fx-sr-only">{'Next'|i18n( 'design/ezflow/block' )}</span></button>
        </div>
    </header>
    <ul class="fx-carousel__track" data-fx-track data-fx-lightbox tabindex="0" aria-label="{$block.name|wash}">
    {foreach $valid_nodes as $valid_node}
        {include uri='design:parts/ezflow/tile.tpl' node=$valid_node}
    {/foreach}
    </ul>
</section>
{undef $valid_nodes}
