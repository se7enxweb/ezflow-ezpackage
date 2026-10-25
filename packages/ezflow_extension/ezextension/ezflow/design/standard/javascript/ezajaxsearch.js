/**
 * AJAX search used by the frontpage edit views and the search block
 * (Exponential, jQuery + ezjsc::jqueryio).
 *
 *   eZAJAXSearch.cfg = { searchstring: '#id', searchbutton: '#id', searchresults: '#id',
 *                        resulttemplate: '...', noresulttemplate: '...', dateformattype: 'shortdatetime',
 *                        customSearchAttributes: [ '#id', ... ], backendUri: 'ezjsc::search' };
 *   eZAJAXSearch.init();
 */
var eZAJAXSearch = function()
{
    var ret = {};

    var jCallback = function($)
    {
        var successCallBack = function(data)
        {
            if (data !== undefined && data !== null)
            {
                var response = data;

                if (response.content && response.content.SearchResult !== undefined)
                {
                    var itemCount = response.content.SearchResult.length;

                    var resultsTarget = $(ret.cfg.searchresults);
                    resultsTarget.html('');
                    resultsTarget.addClass('loading');

                    if( itemCount == 0 )
                    {
                        var template = ret.cfg.noresulttemplate;
                        template = template.replace(/\{+search_string+\}/, response.content.SearchString);

                        resultsTarget.append($.parseHTML(template));
                    }

                    for(var i = 0; i < itemCount; i++)
                    {
                        var item = response.content.SearchResult[i];

                        var template = ret.cfg.resulttemplate;
                        template = template.replace(/\{+title+\}/, item.name);
                        if ( item.published_date === undefined )
                        {
                            var date = new Date( item.published * 1000 );
                            var dateString = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ' + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay();
                            template = template.replace(/\{+date+\}/, dateString);
                        }
                        else
                        {
                            template = template.replace(/\{+date+\}/, item.published_date);
                        }
                        template = template.replace(/\{+class_name+\}/, item.class_name);
                        template = template.replace(/\{+url_alias+\}/, item.url_alias);
                        template = template.replace(/\{+object_id+\}/, item.id);
                        template = template.replace(/\{+node_id+\}/, item.node_id);

                        resultsTarget.append($.parseHTML(template));
                    }

                    resultsTarget.removeClass('loading');
                }
            }
        };

        var getValueForSelector = function(sel)
        {
            var value, node = $(sel).first();

            if ( node.length )
            {
                var nodeName = node[0].nodeName.toLowerCase();
                if ( nodeName === 'input'
                     && ( node[0].type === 'radio' || node[0].type === 'checkbox') )
                {
                    var checked = $(sel).filter(':checked').first();
                    value = checked.length ? checked.val() : null;
                }
                else if (nodeName == 'select'
                                && node[0].hasAttribute('multiple'))
                {
                    value = [];
                    $.each( node[0].options, function( i, option )
                    {
                        if ( option.selected )
                            value.push( option.value );
                    });
                    value = value.join(',');
                }
                else
                {
                    value = node.val();
                }
            }

            return value;
        };

        var performSearch = function()
        {
            var searchString = getValueForSelector(ret.cfg.searchstring);
            var dateFormatType = ret.cfg.dateformattype !== undefined ? ret.cfg.dateformattype : 'shortdatetime';

            var value, data = 'SearchStr=' + searchString;
            data += '&SearchLimit=' + getValueForSelector('[name=SearchLimit]');

            if (value = getValueForSelector('[name=SearchOffset]'))
                data += '&SearchOffset=' + value;

            if (value = getValueForSelector('[name=SearchSectionID]'))
                data += '&SearchSectionID=' + value;

            if (value = getValueForSelector('[name=SearchDate]'))
                data += '&SearchDate=' +  value;

            if (value = getValueForSelector('[name=SearchContentClassAttributeID]'))
                data += '&SearchContentClassAttributeID=' + value;

            if (value = getValueForSelector('[name=SearchContentClassID]'))
                data += '&SearchContentClassID=' + value;

            if (value = getValueForSelector('[name=SearchContentClassIdentifier]'))
                data += '&SearchContentClassIdentifier=' + value;

            if (value = getValueForSelector('[name=SearchSubTreeArray]'))
                data += '&SearchSubTreeArray=' + value;

            if (value = getValueForSelector('[name=SearchTimestamp]'))
                data += '&SearchTimestamp=' + value;

            data += '&EncodingFormatDate=' + dateFormatType;

            if ( ret.cfg.customSearchAttributes !== undefined )
            {
                for ( var i = 0, l = ret.cfg.customSearchAttributes.length; i < l; i++ )
                {
                    var attribute = $( ret.cfg.customSearchAttributes[i] ).first();
                    data += '&' + attribute.attr('name') + '=' + attribute.val();
                }
            }

            var backendUri = ret.cfg.backendUri ? ret.cfg.backendUri : 'ezjsc::search' ;

            if(searchString !== '')
            {
                $.ez(backendUri, data, successCallBack);
            }
        };

        var handleClick = function(e)
        {
            performSearch();
            e.preventDefault();
        };

        var handleKeyPress = function(e)
        {
            var key = e.which || e.keyCode;
            if (key === 13)
            {
                performSearch();
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        $(ret.cfg.searchbutton).first().on('click', handleClick);
        $(ret.cfg.searchstring).first().on('keypress', handleKeyPress);
    };
    ret.cfg = {};

    ret.init = function()
    {
        jQuery(jCallback);
    };

    return ret;
}();

/*
 * Templates without inline code: an element with data-ezflow-ajaxsearch carries the settings above as data
 * attributes (data-search-string, data-search-button, data-search-results, data-date-format, data-result-template,
 * data-noresult-template, data-backend-uri; data-custom-search-attributes as a JSON list of selectors) and the search starts from them when the page is ready, the way the
 * inline "eZAJAXSearch.cfg = { ... }; eZAJAXSearch.init();" did. Set up once, however often this file is printed.
 */
( function()
{
    if ( eZAJAXSearch.dataSetup ) return;
    eZAJAXSearch.dataSetup = true;

    var keys = { 'searchstring': 'data-search-string', 'searchbutton': 'data-search-button',
                 'searchresults': 'data-search-results', 'dateformattype': 'data-date-format',
                 'resulttemplate': 'data-result-template', 'noresulttemplate': 'data-noresult-template',
                 'backendUri': 'data-backend-uri' };

    var start = function()
    {
        var boxes = document.querySelectorAll( '[data-ezflow-ajaxsearch]' );
        for ( var i = 0; i < boxes.length; i++ )
        {
            var box = boxes[i];
            if ( box.getAttribute( 'data-ezflow-ajaxsearch-ready' ) ) continue;
            box.setAttribute( 'data-ezflow-ajaxsearch-ready', '1' );
            var cfg = {};
            for ( var key in keys )
            {
                if ( box.hasAttribute( keys[key] ) ) cfg[key] = box.getAttribute( keys[key] );
            }
            if ( box.hasAttribute( 'data-custom-search-attributes' ) )
            {
                try
                {
                    cfg.customSearchAttributes = JSON.parse( box.getAttribute( 'data-custom-search-attributes' ) );
                }
                catch ( e ) {}
            }
            eZAJAXSearch.cfg = cfg;
            eZAJAXSearch.init();
        }
    };

    if ( document.readyState === 'loading' )
        document.addEventListener( 'DOMContentLoaded', start );
    else
        start();
} )();
