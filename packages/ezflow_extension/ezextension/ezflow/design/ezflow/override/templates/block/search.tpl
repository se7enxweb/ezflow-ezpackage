<h2>{$block.name|wash()}</h2>
<form id="search-form-{$block.id}" action="{'ezajax/search'|ezurl('no')}" method="post">
    <input id="search-string-{$block.id}" type="text" name="SearchStr" value="" />
    <input id="search-button-{$block.id}" class="button" type="submit" name="SearchButton" value="{'Search'|i18n( 'design/ezflow/block/search' )}" />
    <input name="SearchOffset" type="hidden" value="0"  />
    <input name="SearchLimit" type="hidden" value="10"  />
</form>

<div id="search-results-{$block.id}"></div>
{ezscript_require( array( 'ezjsc::jquery', 'ezjsc::jqueryio', 'ezajaxsearch.js' ) )}

{* The quick search settings, read by ezajaxsearch.js when the page is ready (no inline code). *}
{set-block variable=ezflow_noresult_template}<p>{'No search results found for:'|i18n( 'design/ezflow/block/search' )} "{ldelim}search_string{rdelim}"</p>{/set-block}
{set-block variable=ezflow_result_template}<div class="result-item float-break"><div class="item-title"><a href="{ldelim}url_alias{rdelim}">{ldelim}title{rdelim}</a></div><div class="item-published-date">[{ldelim}class_name{rdelim}] {ldelim}date{rdelim}</div></div>{/set-block}
<div hidden="hidden"
     data-ezflow-ajaxsearch="1"
     data-search-string="#search-string-{$block.id|wash}"
     data-search-button="#search-button-{$block.id|wash}"
     data-search-results="#search-results-{$block.id|wash}"
     data-date-format="shortdatetime"
     data-noresult-template="{$ezflow_noresult_template|wash}"
     data-result-template="{$ezflow_result_template|wash}"></div>
