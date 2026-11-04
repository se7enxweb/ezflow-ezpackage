{* The ezflow scripts a view needs, as one ES module through the packer (type="module": deferred, strict, CSP-safe;
   no inline code), after ezflow_core.js; with the address of the ezjscore server calls for eZFlow.io.
   Parameter: scripts (the files after ezflow_core.js, in order). *}
<span hidden="hidden" data-ezflow-call={'ezjscore/call'|ezurl}></span>
{foreach ezscriptfiles( array( 'ezflow_core.js' )|merge( $scripts ), 2 ) as $ezflow_script_src}
<script type="module" src="{$ezflow_script_src}"></script>
{/foreach}
