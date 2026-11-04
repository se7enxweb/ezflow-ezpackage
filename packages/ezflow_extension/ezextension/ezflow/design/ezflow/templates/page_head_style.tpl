{* The design's stylesheet first, then the stylesheets other extensions list for the front end. The old ezflow.css and
   the image-corner stylesheets of earlier versions are not loaded: ezflow-site.css draws every box from tokens. *}
{def $fx_css = array( 'ezflow-site.css' )}
{foreach ezini( 'StylesheetSettings', 'CSSFileList', 'design.ini' )|merge( ezini( 'StylesheetSettings', 'FrontendCSSFileList', 'design.ini' ) ) as $fx_file}
    {if and( $fx_file|ne( 'ezflow.css' ), $fx_css|contains( $fx_file )|not )}{set $fx_css = $fx_css|append( $fx_file )}{/if}
{/foreach}
{ezcss_load( $fx_css )}
<link rel="stylesheet" href={"stylesheets/ezflow-print.css"|ezdesign} media="print">
{undef $fx_css}
