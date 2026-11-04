{* The heading of a block: its name, and a link to the section its items come from (parameter more: a node). *}
{if or( $block.name|trim, is_set( $more ) )}
<header class="fx-block__head">
    {if $block.name|trim}<h2 class="fx-block__title" id="fx-b-{$block.id}">{$block.name|wash}</h2>{/if}
    {if and( is_set( $more ), $more )}<a class="fx-link-arrow fx-block__more" href={$more.url_alias|ezurl}>{'Show all'|i18n( 'design/ezflow/block' )}<span class="fx-sr-only">: {$more.name|wash}</span></a>{/if}
</header>
{/if}
