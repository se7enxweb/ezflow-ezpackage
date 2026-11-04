{* search: a search form. It posts to content/search; with JavaScript the first results show below it without
   leaving the page (javascript/ezflow-site.js, through ezjscore's ezjsc::search, as ezajaxsearch.js did). *}
<section class="fx-block fx-block--compact fx-panel" aria-labelledby="fx-b-{$block.id}">
    <header class="fx-block__head"><h2 class="fx-block__title" id="fx-b-{$block.id}">{cond( $block.name|trim, $block.name, 'Search'|i18n( 'design/ezflow/block/search' ) )|wash}</h2></header>
    <form class="fx-inline-search" role="search" method="post" action={"/content/search"|ezurl}
          data-fx-quicksearch data-fx-call={"ezjscore/call"|ezurl} data-fx-base={"/"|ezurl} data-fx-limit="6"
          data-fx-none="{'No search results found for:'|i18n( 'design/ezflow/block/search' )|wash}">
        <label class="fx-sr-only" for="fx-qs-{$block.id}">{'Search'|i18n( 'design/ezflow/block/search' )}</label>
        <input id="fx-qs-{$block.id}" type="search" name="SearchText" autocomplete="off">
        <button class="fx-btn" type="submit">{'Search'|i18n( 'design/ezflow/block/search' )}</button>
    </form>
    <div class="fx-qs-results" data-fx-quicksearch-results aria-live="polite"></div>
</section>
