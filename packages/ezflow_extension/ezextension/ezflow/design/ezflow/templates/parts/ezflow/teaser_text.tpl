{* The teaser text of a node: the intro of an article, the short description of a folder or gallery, the text of an
   event, the start of a blog post, the description of a poll. Parameter: node. *}
{def $fx_tt = $node.data_map}
{if and( is_set( $fx_tt.intro ), $fx_tt.intro.has_content )}{attribute_view_gui attribute=$fx_tt.intro}
{elseif and( is_set( $fx_tt.short_description ), $fx_tt.short_description.has_content )}{attribute_view_gui attribute=$fx_tt.short_description}
{elseif and( is_set( $fx_tt.text ), $fx_tt.text.has_content )}{attribute_view_gui attribute=$fx_tt.text}
{elseif and( is_set( $fx_tt.body ), $fx_tt.body.has_content )}<p>{$fx_tt.body.content.output.output_text|striptags|trim|shorten( 170 )}</p>
{elseif and( is_set( $fx_tt.description ), $fx_tt.description.has_content )}{attribute_view_gui attribute=$fx_tt.description}
{elseif and( is_set( $fx_tt.caption ), $fx_tt.caption.has_content )}{attribute_view_gui attribute=$fx_tt.caption}
{/if}
{undef $fx_tt}
