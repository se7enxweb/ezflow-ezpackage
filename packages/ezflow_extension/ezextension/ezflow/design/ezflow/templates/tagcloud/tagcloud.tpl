{* The tag cloud as a list of pills; a tag's weight is a class (fx-w1 to fx-w4), not an inline font size. *}
<ul class="fx-tagcloud">
{foreach $tag_cloud as $tag}
<li><a class="fx-w{cond( $tag['font_size']|gt( 180 ), 4, $tag['font_size']|gt( 145 ), 3, $tag['font_size']|gt( 115 ), 2, 1 )}" href={concat( "/content/keyword/", $tag['tag']|rawurlencode )|ezurl()} title="{'%count objects tagged with \'%tag\''|i18n( 'design/ezwebin/tagcloud/tagcloud',, hash( '%count', $tag['count'], '%tag', $tag['tag']|wash() ) )}">{$tag['tag']|wash()}</a></li>
{/foreach}
</ul>
