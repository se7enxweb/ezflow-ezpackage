/*
 * ezflow: the banner blocks (block/banner1.tpl, block/banner2.tpl) without inline code. Each block prints a
 * placeholder with data-ezflow-banner-zone and data-ezflow-banner-url, then this file (a plain, synchronous script).
 * It takes the first placeholder not served yet and writes the ad server's script tag after itself, the way the
 * inline OpenX/OpenAds tag did (document.write, which needs a script that runs while the page is parsed). The file
 * runs once for every block that prints it.
 */
( function()
{
    var spots = document.querySelectorAll( '[data-ezflow-banner-zone]' ), spot = null;
    for ( var i = 0; i < spots.length; i++ )
    {
        if ( !spots[i].getAttribute( 'data-ezflow-banner-done' ) )
        {
            spot = spots[i];
            break;
        }
    }
    if ( !spot ) return;
    spot.setAttribute( 'data-ezflow-banner-done', '1' );

    var url = spot.getAttribute( 'data-ezflow-banner-url' );
    var m3_u = ( location.protocol == 'https:' ? 'https:' : 'http:' ) + url;
    var m3_r = Math.floor( Math.random() * 99999999999 );
    if ( !document.MAX_used ) document.MAX_used = ',';
    document.write( "<scr" + "ipt type='text/javascript' src='" + m3_u );
    document.write( "?zoneid=" + encodeURIComponent( spot.getAttribute( 'data-ezflow-banner-zone' ) ) );
    document.write( '&amp;cb=' + m3_r );
    if ( document.MAX_used != ',' ) document.write( "&amp;exclude=" + document.MAX_used );
    document.write( "&amp;loc=" + escape( window.location ) );
    if ( document.referrer ) document.write( "&amp;referer=" + escape( document.referrer ) );
    if ( document.context ) document.write( "&context=" + escape( document.context ) );
    if ( document.mmm_fo ) document.write( "&amp;mmm_fo=1" );
    document.write( "'><\/scr" + "ipt>" );
} )();
