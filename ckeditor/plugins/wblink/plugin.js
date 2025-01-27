/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

(function () {
    "use strict";
    
    CKEDITOR.plugins.add( 'wblink', {
        requires: 'dialog,fakeobjects',
        lang: 'de,en',
        icons: 'anchor,anchor-rtl,link,unlink',
        
        onLoad: function() {
            // Add the CSS styles for anchor placeholders.
            var baseStyle = 'background:url(' + CKEDITOR.getUrl( this.path + 'icons/anchor.png' ) + ') no-repeat %1 center; border:1px dotted #00f;background-size:16px;';
            
            var template = '.%2 a.cke_anchor,' +
                '.%2 a.cke_anchor_empty' +
                ',.cke_editable.%2 a[name]' +
                ',.cke_editable.%2 a[data-cke-saved-name]' +
                '{' +
                    baseStyle +
                    'padding-%1:18px;' +
                    // Show the arrow cursor for the anchor image (FF at least).
                    'cursor:auto;' +
                '}' +
                '.%2 img.cke_anchor' +
                '{' +
                    baseStyle +
                    'width:16px;' +
                    'min-height:15px;' +
                    // The default line-height on IE.
                    'height:1.15em;' +
                    // Opera works better with "middle" (even if not perfect)
                    'vertical-align:text-bottom;' +
                '}';
            
            // Styles with contents direction awareness.
            function cssWithDir( dir ) {
                return template.replace( /%1/g, dir == 'rtl' ? 'right' : 'left' ).replace( /%2/g, 'cke_contents_' + dir );
            }
            
            CKEDITOR.addCss( cssWithDir( 'ltr' ) + cssWithDir( 'rtl' ) );
        },
        
        init: function( editor ) {
            var allowed = 'a[!href]',
                required = 'a[href]';
            
            if ( CKEDITOR.dialog.isTabEnabled( editor, 'wblink', 'advanced' ) )
                allowed = allowed.replace( ']', ',accesskey,charset,dir,id,lang,name,rel,tabindex,title,type]{*}(*)' );
            if ( CKEDITOR.dialog.isTabEnabled( editor, 'wblink', 'target' ) )
                allowed = allowed.replace( ']', ',target,onclick]' );
            
            // Add the link and unlink buttons.
            editor.addCommand( 'wblink', new CKEDITOR.dialogCommand( 'wblink', {
                allowedContent: allowed,
                requiredContent: required
            } ) );
            editor.addCommand( 'anchor', new CKEDITOR.dialogCommand( 'anchor', {
                allowedContent: 'a[!name,id]',
                requiredContent: 'a[name]'
            } ) );
            editor.addCommand( 'unlink', new CKEDITOR.unlinkCommand() );
            editor.addCommand( 'removeAnchor', new CKEDITOR.removeAnchorCommand() );
            
            editor.setKeystroke( CKEDITOR.CTRL + 76 /*L*/, 'wblink' );
            
            if ( editor.ui.addButton ) {
                editor.ui.addButton( 'Link', {
                    label: editor.lang.wblink.toolbar,
                    command: 'wblink',
                    toolbar: 'links,10'
                });
                editor.ui.addButton( 'Unlink', {
                    label: editor.lang.wblink.unlink,
                    command: 'unlink',
                    toolbar: 'links,20'
                });
                editor.ui.addButton( 'Anchor', {
                    label: editor.lang.wblink.anchor.toolbar,
                    command: 'anchor',
                    toolbar: 'links,30'
                });
            }
            
            CKEDITOR.dialog.add( 'wblink', this.path + 'dialogs/wblink.js' );
            CKEDITOR.dialog.add( 'anchor', this.path + 'dialogs/anchor.js' );
            
            editor.on( 'doubleclick', function( evt ) {
                var element = CKEDITOR.plugins.wblink.getSelectedLink( editor ) || evt.data.element;
                
                if ( !element.isReadOnly() ) {
                    if ( element.is( 'a' ) ) {
                        evt.data.dialog = ( element.getAttribute( 'name' ) && ( !element.getAttribute( 'href' ) || !element.getChildCount() ) ) ? 'anchor' : 'wblink';
                        
                        // Pass the link to be selected along with event data.
                        evt.data.link = element;
                    } else if ( CKEDITOR.plugins.wblink.tryRestoreFakeAnchor( editor, element ) ) {
                        evt.data.dialog = 'anchor';
                    }
                }
            }, null, null, 0 );
            
            // If event was cancelled, link passed in event data will not be selected.
            editor.on( 'doubleclick', function( evt ) {
                // Make sure both links and anchors are selected (#11822).
                if ( evt.data.link )
                    editor.getSelection().selectElement( evt.data.link );
            }, null, null, 20 );
            
            // If the "menu" plugin is loaded, register the menu items.
            if ( editor.addMenuItems ) {
                editor.addMenuItems({
                    anchor: {
                        label: editor.lang.wblink.anchor.menu,
                        command: 'anchor',
                        group: 'anchor',
                        order: 1
                    },
                    
                    removeAnchor: {
                        label: editor.lang.wblink.anchor.remove,
                        command: 'removeAnchor',
                        group: 'anchor',
                        order: 5
                    },
                    
                    wblink: {
                        label: editor.lang.wblink.menu,
                        command: 'wblink',
                        group: 'link',
                        order: 1
                    },
                    
                    unlink: {
                        label: editor.lang.wblink.unlink,
                        command: 'unlink',
                        group: 'link',
                        order: 5
                    }
                });
            }
            
            // If the "contextmenu" plugin is loaded, register the listeners.
            if ( editor.contextMenu ) {
                editor.contextMenu.addListener( function( element, selection ) {
                    if ( !element || element.isReadOnly() )
                        return null;
                    
                    var anchor = CKEDITOR.plugins.wblink.tryRestoreFakeAnchor( editor, element );
                    
                    if ( !anchor && !( anchor = CKEDITOR.plugins.wblink.getSelectedLink( editor ) ) )
                        return null;
                    
                    var menu = {};
                    
                    if ( anchor.getAttribute( 'href' ) && anchor.getChildCount() )
                        menu = { wblink : CKEDITOR.TRISTATE_OFF, unlink : CKEDITOR.TRISTATE_OFF };	
                    
                    if ( anchor && anchor.hasAttribute( 'name' ) )
                        menu.anchor = menu.removeAnchor = CKEDITOR.TRISTATE_OFF;
                    
                    return menu;
                });
            }
            
            this.compiledProtectionFunction = getCompiledProtectionFunction( editor );
        },
        
            afterInit: function( editor ) {
                // Empty anchors upcasting to fake objects.
                editor.dataProcessor.dataFilter.addRules( {
                    elements: {
                        a: function( element ) {
                            if ( !element.attributes.name )
                                return null;
                            
                            if ( !element.children.length )
                                return editor.createFakeParserElement( element, 'cke_anchor', 'anchor' );
                            
                            return null;
                        }
                    }
                } );
                
                var pathFilters = editor._.elementsPath && editor._.elementsPath.filters;
                if ( pathFilters ) {
                pathFilters.push( function( element, name ) {
                    if ( name == 'a' ) {
                        if ( CKEDITOR.plugins.wblink.tryRestoreFakeAnchor( editor, element ) || ( element.getAttribute( 'name' ) && ( !element.getAttribute( 'href' ) || !element.getChildCount() ) ) ) {
                            return 'anchor';
                        }
                    }
                });
            }
        }
    });
    
	// Loads the parameters in a selected link to the link dialog fields.
	var javascriptProtocolRegex = /^javascript:/,
		emailRegex = /^mailto:([^?]+)(?:\?(.+))?$/,
		emailSubjectRegex = /subject=([^;?:@&=$,\/]*)/i,
		emailBodyRegex = /body=([^;?:@&=$,\/]*)/i,
		anchorRegex = /^#(.*)$/,
		urlRegex = /^((?:http|https|ftp|news):\/\/)?(.*)$/,
		selectableTargets = /^(_(?:self|top|parent|blank))$/,
		encodedEmailLinkRegex = /^javascript:void\(location\.href='mailto:'\+String\.fromCharCode\(([^)]+)\)(?:\+'(.*)')?\)$/,
		functionCallProtectedEmailLinkRegex = /^javascript:([^(]+)\(([^)]+)\)$/,
		popupRegex = /\s*window.open\(\s*this\.href\s*,\s*(?:'([^']*)'|null)\s*,\s*'([^']*)'\s*\)\s*;\s*return\s*false;*\s*/,
		popupFeaturesRegex = /(?:^|,)([^=]+)=(\d+|yes|no)/gi;
    
	var advAttrNames = {
		id: 'advId',
		dir: 'advLangDir',
		accessKey: 'advAccessKey',
		// 'data-cke-saved-name': 'advName',
		name: 'advName',
		lang: 'advLangCode',
		tabindex: 'advTabIndex',
		title: 'advTitle',
		type: 'advContentType',
		'class': 'advCSSClasses',
		charset: 'advCharset',
		style: 'advStyles',
		rel: 'advRel'
	};
    
	function unescapeSingleQuote( str ) {
		return str.replace( /\\'/g, '\'' );
	}
    
	function escapeSingleQuote( str ) {
		return str.replace( /'/g, '\\$&' );
	}
    
	function protectEmailAddressAsEncodedString( address ) {
		var charCode,
			length = address.length,
			encodedChars = [];
        
		for ( var i = 0; i < length; i++ ) {
			charCode = address.charCodeAt( i );
			encodedChars.push( charCode );
		}
        
		return 'String.fromCharCode(' + encodedChars.join( ',' ) + ')';
	}
    
	function protectEmailLinkAsFunction( editor, email ) {
		var plugin = editor.plugins.wblink,
			name = plugin.compiledProtectionFunction.name,
			params = plugin.compiledProtectionFunction.params,
			paramName, paramValue, retval;
        
		retval = [ name, '(' ];
		for ( var i = 0; i < params.length; i++ ) {
			paramName = params[ i ].toLowerCase();
			paramValue = email[ paramName ];
            
			i > 0 && retval.push( ',' );
			retval.push( '\'', paramValue ? escapeSingleQuote( encodeURIComponent( email[ paramName ] ) ) : '', '\'' );
		}
		retval.push( ')' );
		return retval.join( '' );
	}
    
	function getCompiledProtectionFunction( editor ) {
		var emailProtection = editor.config.emailProtection || '',
			compiledProtectionFunction;
        
		// Compile the protection function pattern.
		if ( emailProtection && emailProtection != 'encode' ) {
			compiledProtectionFunction = {};
            
			emailProtection.replace( /^([^(]+)\(([^)]+)\)$/, function( match, funcName, params ) {
				compiledProtectionFunction.name = funcName;
				compiledProtectionFunction.params = [];
				params.replace( /[^,\s]+/g, function( param ) {
					compiledProtectionFunction.params.push( param );
				} );
			} );
		}
        
		return compiledProtectionFunction;
	}
    
    /**
     * Set of wblink plugin's helpers.
     *
     * @class
     * @singleton
     */
    CKEDITOR.plugins.wblink = {
        /**
         * Get the surrounding link element of the current selection.
         *
         *		CKEDITOR.plugins.link.getSelectedLink( editor );
         *
         *		// The following selections will all return the link element.
         *
         *		<a href="#">li^nk</a>
         *		<a href="#">[link]</a>
         *		text[<a href="#">link]</a>
         *		<a href="#">li[nk</a>]
         *		[<b><a href="#">li]nk</a></b>]
         *		[<a href="#"><b>li]nk</b></a>
         *
         * @since 3.2.1
         * @param {CKEDITOR.editor} editor
         */
        getSelectedLink: function( editor ) {
            var selection = editor.getSelection();
            var selectedElement = selection.getSelectedElement();
            if ( selectedElement && selectedElement.is( 'a' ) )
                return selectedElement;
            
            var range = selection.getRanges()[ 0 ];
            
            if ( range ) {
                range.shrink( CKEDITOR.SHRINK_TEXT );
                return editor.elementPath( range.getCommonAncestor() ).contains( 'a', 1 );
            }
            return null;
        },
        
        /**
         * Collects anchors available in the editor (i.e. used by the Link plugin).
         * Note that the scope of search is different for inline (the "global" document) and
         * classic (`iframe`-based) editors (the "inner" document).
         *
         * @since 4.3.3
         * @param {CKEDITOR.editor} editor
         * @returns {CKEDITOR.dom.element[]} An array of anchor elements.
         */
        getEditorAnchors: function( editor ) {
            var editable = editor.editable(),
                
                // The scope of search for anchors is the entire document for inline editors
                // and editor's editable for classic editor/divarea (#11359).
                scope = ( editable.isInline() && !editor.plugins.divarea ) ? editor.document : editable,
                
                links = scope.getElementsByTag( 'a' ),
                imgs = scope.getElementsByTag( 'img' ),
                anchors = [],
                i = 0,
                item;
            
            // Retrieve all anchors within the scope.
            while ( ( item = links.getItem( i++ ) ) ) {
                if ( item.data( 'cke-saved-name' ) || item.hasAttribute( 'name' ) ) {
                    anchors.push( {
                        name: item.data( 'cke-saved-name' ) || item.getAttribute( 'name' ),
                        id: item.getAttribute( 'id' )
                    } );
                }
            }
            
            // Retrieve all "fake anchors" within the scope.
            i = 0;
            
            while ( ( item = imgs.getItem( i++ ) ) ) {
                if ( ( item = this.tryRestoreFakeAnchor( editor, item ) ) ) {
                    anchors.push( {
                        name: item.getAttribute( 'name' ),
                        id: item.getAttribute( 'id' )
                    } );
                }
            }
            
            return anchors;
        },
        
        /**
         * Opera and WebKit do not make it possible to select empty anchors. Fake
         * elements must be used for them.
         *
         * @readonly
         * @deprecated 4.3.3 It is set to `true` in every browser.
         * @property {Boolean}
         */
        fakeAnchor: true,
        
        /**
         * For browsers that do not support CSS3 `a[name]:empty()`. Note that IE9 is included because of #7783.
         *
         * @readonly
         * @deprecated 4.3.3 It is set to `false` in every browser.
         * @property {Boolean} synAnchorSelector
         */
        
        /**
         * For browsers that have editing issues with an empty anchor.
         *
         * @readonly
         * @deprecated 4.3.3 It is set to `false` in every browser.
         * @property {Boolean} emptyAnchorFix
         */
        
        /**
         * Returns an element representing a real anchor restored from a fake anchor.
         * 
         * @param {CKEDITOR.editor} editor
         * @param {CKEDITOR.dom.element} element
         * @returns {CKEDITOR.dom.element} Restored anchor element or nothing if the 
         * passed element was not a fake anchor.
         */
        tryRestoreFakeAnchor: function( editor, element ) {
            if ( element && element.data( 'cke-real-element-type' ) && element.data( 'cke-real-element-type' ) == 'anchor' ) {
                var link = editor.restoreRealElement( element );
                if ( link.data( 'cke-saved-name' ) )
                        return link;
                }
            },
        
            /**
             * Parses attributes of the link element and returns an object representing
             * the current state (data) of the link. This data format is a plain object accepted
             * e.g. by the Link dialog window and {@link #getLinkAttributes}.
             *
             * @since 4.4
             * @param {CKEDITOR.editor} editor
             * @param {CKEDITOR.dom.element} element
             * @returns {Object} An object of link data.
             */
            parseLinkAttributes: function( editor, element ) {
                var href = ( element && ( element.data( 'cke-saved-href' ) || element.getAttribute( 'href' ) ) ) || '',
                    compiledProtectionFunction = editor.plugins.wblink.compiledProtectionFunction,
                    emailProtection = editor.config.emailProtection,
                    javascriptMatch, emailMatch, anchorMatch, urlMatch,
                    retval = {};
                
                if ( ( javascriptMatch = href.match( javascriptProtocolRegex ) ) ) {
                    if ( emailProtection == 'encode' ) {
                        href = href.replace( encodedEmailLinkRegex, function( match, protectedAddress, rest ) {
                            return 'mailto:' +
                                String.fromCharCode.apply( String, protectedAddress.split( ',' ) ) +
                                ( rest && unescapeSingleQuote( rest ) );
                        } );
                    }
                    // Protected email link as function call.
                    else if ( emailProtection ) {
                        href.replace( functionCallProtectedEmailLinkRegex, function( match, funcName, funcArgs ) {
                            if ( funcName == compiledProtectionFunction.name ) {
                                retval.type = 'email';
                                var email = retval.email = {};
                                
                                var paramRegex = /[^,\s]+/g,
                                    paramQuoteRegex = /(^')|('$)/g,
                                    paramsMatch = funcArgs.match( paramRegex ),
                                    paramsMatchLength = paramsMatch.length,
                                    paramName, paramVal;
                                
                                for ( var i = 0; i < paramsMatchLength; i++ ) {
                                    paramVal = decodeURIComponent( unescapeSingleQuote( paramsMatch[ i ].replace( paramQuoteRegex, '' ) ) );
                                    paramName = compiledProtectionFunction.params[ i ].toLowerCase();
                                    email[ paramName ] = paramVal;
                                }
                                email.address = [ email.name, email.domain ].join( '@' );
                            }
                        } );
                    }
                }
                
                if ( !retval.type ) {
                    if ( ( anchorMatch = href.match( anchorRegex ) ) ) {
                        retval.type = 'anchor';
                        retval.anchor = {};
                        retval.anchor.name = retval.anchor.id = anchorMatch[ 1 ];
                    }
                    // Protected email link as encoded string.
                    else if ( ( emailMatch = href.match( emailRegex ) ) ) {
                        var subjectMatch = href.match( emailSubjectRegex ),
                            bodyMatch = href.match( emailBodyRegex );
                        
                        retval.type = 'email';
                        var email = ( retval.email = {} );
                        email.address = emailMatch[ 1 ];
                        subjectMatch && ( email.subject = decodeURIComponent( subjectMatch[ 1 ] ) );
                        bodyMatch && ( email.body = decodeURIComponent( bodyMatch[ 1 ] ) );
                    }
                    // urlRegex matches empty strings, so need to check for href as well.
                    else if ( href && ( urlMatch = href.match( urlRegex ) ) ) {
                        retval.type = 'url';
                        if (urlMatch[ 2 ].search(/\[wblink/) === 0) retval.type = 'wblink';
                        retval.url = {};
                        retval.url.protocol = urlMatch[ 1 ];
                        retval.url.url = urlMatch[ 2 ];
                    }else
                        retval.type = 'url';
                }
                
                // Load target and popup settings.
                if ( element ) {
                    var target = element.getAttribute( 'target' );
                    
                    // IE BUG: target attribute is an empty string instead of null in IE if it's not set.
                    if ( !target ) {
                        var onclick = element.data( 'cke-pa-onclick' ) || element.getAttribute( 'onclick' ),
                            onclickMatch = onclick && onclick.match( popupRegex );
                        
                        if ( onclickMatch ) {
                            retval.target = {
                                type: 'popup',
                                name: onclickMatch[ 1 ]
                            };
                            
                            var featureMatch;
                            while ( ( featureMatch = popupFeaturesRegex.exec( onclickMatch[ 2 ] ) ) ) {
                                // Some values should remain numbers (#7300)
                                if ( ( featureMatch[ 2 ] == 'yes' || featureMatch[ 2 ] == '1' ) && !( featureMatch[ 1 ] in { height: 1, width: 1, top: 1, left: 1 } ) )
                                    retval.target[ featureMatch[ 1 ] ] = true;
                                else if ( isFinite( featureMatch[ 2 ] ) )
                                    retval.target[ featureMatch[ 1 ] ] = featureMatch[ 2 ];
                            }
                        }
                    } else {
                        retval.target = {
                            type: target.match( selectableTargets ) ? target : 'frame',
                            name: target
                        };
                    }
                    
                    var advanced = {};
                    
                    for ( var a in advAttrNames ) {
                        var val = element.getAttribute( a );
                        
                        if ( val )
                            advanced[ advAttrNames[ a ] ] = val;
                    }
                    
                    var advName = element.data( 'cke-saved-name' ) || advanced.advName;
                    
                    if ( advName )
                        advanced.advName = advName;
                    
                    if ( !CKEDITOR.tools.isEmpty( advanced ) )
                        retval.advanced = advanced;
                }
                
                return retval;
            },
            
            /**
             * Converts link data produced by {@link #parseLinkAttributes} into an object which consists
             * of attributes to be set (with their values) and an array of attributes to be removed.
             * This method can be used to compose or to update any link element with the given data.
             *
             * @since 4.4
             * @param {CKEDITOR.editor} editor
             * @param {Object} data Data in {@link #parseLinkAttributes} format.
             * @returns {Object} An object consisting of two keys, i.e.:
             *
             *		{
             *			// Attributes to be set.
             *			set: {
             *				href: 'http://foo.bar',
             *				target: 'bang'
             *			},
             *			// Attributes to be removed.
             *			removed: [
             *				'id', 'style'
             *			]
             *		}
             *
             */
            getLinkAttributes: function( editor, data ) {
                var emailProtection = editor.config.emailProtection || '',
                    set = {};
                
                // Compose the URL.
                switch ( data.type ) {
                    case 'url':
                        var protocol = ( data.url && data.url.protocol !== undefined ) ? data.url.protocol : 'http://',
                            url = ( data.url && CKEDITOR.tools.trim( data.url.url ) ) || '';
                        
                        set[ 'data-cke-saved-href' ] = ( url.indexOf( '/' ) === 0 ) ? url : protocol + url;
                        
                        break;
                    case 'wblink':
                      if (data.newslink && data.newslink.url !== "") {
                        var url = ( CKEDITOR.tools.trim( data.newslink.url ) );
                      } else {  
                          var url = ( CKEDITOR.tools.trim( data.wblink.url ) ) || '';
                        }
                        set[ 'data-cke-saved-href' ] = url;
                        break;
                    case 'anchor':
                        var name = ( data.anchor && data.anchor.name ),
                            id = ( data.anchor && data.anchor.id );
                        
                        set[ 'data-cke-saved-href' ] = '#' + ( name || id || '' );
                        
                        break;
                    case 'email':
                        var email = data.email,
                            address = email.address,
                            linkHref;
                        
                        switch ( emailProtection ) {
                            case '':
                            case 'encode':
                                var subject = encodeURIComponent( email.subject || '' ),
                                    body = encodeURIComponent( email.body || '' ),
                                    argList = [];
                                
                                // Build the e-mail parameters first.
                                subject && argList.push( 'subject=' + subject );
                                body && argList.push( 'body=' + body );
                                argList = argList.length ? '?' + argList.join( '&' ) : '';
                                
                                if ( emailProtection == 'encode' ) {
                                    linkHref = [
                                        'javascript:void(location.href=\'mailto:\'+',
                                        protectEmailAddressAsEncodedString( address )
                                    ];
                                    // parameters are optional.
                                    argList && linkHref.push( '+\'', escapeSingleQuote( argList ), '\'' );
                                    
                                    linkHref.push( ')' );
                                } else {
                                    linkHref = [ 'mailto:', address, argList ];
                                }
                                
                                break;
                            default:
                                // Separating name and domain.
                                var nameAndDomain = address.split( '@', 2 );
                                email.name = nameAndDomain[ 0 ];
                                email.domain = nameAndDomain[ 1 ];
                                
                                linkHref = [ 'javascript:', protectEmailLinkAsFunction( editor, email ) ];
                        }
                        
                        set[ 'data-cke-saved-href' ] = linkHref.join( '' );
                        break;
                }
                
                // Popups and target.
                if ( data.target ) {
                    if ( data.target.type == 'popup' ) {
                        var onclickList = [
                                'window.open(this.href, \'', data.target.name || '', '\', \''
                            ],
                            featureList = [
                                'resizable', 'status', 'location', 'toolbar', 'menubar', 'fullscreen', 'scrollbars', 'dependent'
                            ],
                            featureLength = featureList.length,
                            addFeature = function( featureName ) {
                                if ( data.target[ featureName ] )
                                    featureList.push( featureName + '=' + data.target[ featureName ] );
                            };
                        
                        for ( var i = 0; i < featureLength; i++ )
                            featureList[ i ] = featureList[ i ] + ( data.target[ featureList[ i ] ] ? '=yes' : '=no' );
                        
                        addFeature( 'width' );
                        addFeature( 'left' );
                        addFeature( 'height' );
                        addFeature( 'top' );
                        
                        onclickList.push( featureList.join( ',' ), '\'); return false;' );
                        set[ 'data-cke-pa-onclick' ] = onclickList.join( '' );
                    }
                    else if ( data.target.type != 'notSet' && data.target.name ) {
                        set.target = data.target.name;
                    }
                }
                
                // Advanced attributes.
                if ( data.advanced ) {
                    for ( var a in advAttrNames ) {
                        var val = data.advanced[ advAttrNames[ a ] ];
                        
                        if ( val )
                            set[ a ] = val;
                    }
                    
                    if ( set.name )
                        set[ 'data-cke-saved-name' ] = set.name;
                }
                
                // Browser need the "href" fro copy/paste link to work. (#6641)
                if ( set[ 'data-cke-saved-href' ] )
                    set.href = set[ 'data-cke-saved-href' ];
                
                var removed = CKEDITOR.tools.extend( {
                    target: 1,
                    onclick: 1,
                    'data-cke-pa-onclick': 1,
                    'data-cke-saved-name': 1
                }, advAttrNames );
                
                // Remove all attributes which are not currently set.
                for ( var s in set )
                    delete removed[ s ];
                
                return {
                    set: set,
                    removed: CKEDITOR.tools.objectKeys( removed )
                };
            }
        };
    
    // TODO Much probably there's no need to expose these as public objects.
    
    CKEDITOR.scriptLoader.load(CKEDITOR.plugins.getPath('wblink')+'pages.php');
    
    CKEDITOR.unlinkCommand = function() {};
    CKEDITOR.unlinkCommand.prototype = {
        exec: function( editor ) {
            var style = new CKEDITOR.style( { element:'a',type:CKEDITOR.STYLE_INLINE,alwaysRemoveElement:1 } );
            editor.removeStyle( style );
        },
        
        refresh: function( editor, path ) {
            // Despite our initial hope, document.queryCommandEnabled() does not work
            // for this in Firefox. So we must detect the state by element paths.
            
            var element = path.lastElement && path.lastElement.getAscendant( 'a', true );
            
            if ( element && element.getName() == 'a' && element.getAttribute( 'href' ) && element.getChildCount() )
                this.setState( CKEDITOR.TRISTATE_OFF );
            else
                this.setState( CKEDITOR.TRISTATE_DISABLED );
        },
        
        contextSensitive: 1,
        startDisabled: 1,
        requiredContent: 'a[href]'
    };
    
    CKEDITOR.removeAnchorCommand = function() {};
    CKEDITOR.removeAnchorCommand.prototype = {
        exec: function( editor ) {
            var sel = editor.getSelection(),
                bms = sel.createBookmarks(),
                anchor;
            if ( sel && ( anchor = sel.getSelectedElement() ) && ( !anchor.getChildCount() ? CKEDITOR.plugins.wblink.tryRestoreFakeAnchor( editor, anchor ) : anchor.is( 'a' ) ) )
                anchor.remove( 1 );
            else {
                if ( ( anchor = CKEDITOR.plugins.wblink.getSelectedLink( editor ) ) ) {
                    if ( anchor.hasAttribute( 'href' ) ) {
                        anchor.removeAttributes( { name:1,'data-cke-saved-name':1 } );
                        anchor.removeClass( 'cke_anchor' );
                    } else
                        anchor.remove( 1 );
                }
            }
            sel.selectBookmarks( bms );
        },
            requiredContent: 'a[name]'
    };
    
    CKEDITOR.tools.extend( CKEDITOR.config, {
        /**
         * Whether to show the Advanced tab in the Link dialog window.
         *
         * @cfg {Boolean} [linkShowAdvancedTab=true]
         * @member CKEDITOR.config
         */
        linkShowAdvancedTab: true,
        
        /**
         * Whether to show the Target tab in the Link dialog window.
         *
         * @cfg {Boolean} [linkShowTargetTab=true]
         * @member CKEDITOR.config
         */
        linkShowTargetTab: true
        
        /**
         * Whether JavaScript code is allowed as a `href` attribute in an anchor tag.
         * With this option enabled it is possible to create links like:
         *
         *		<a href="javascript:alert('Hello world!')">hello world</a>
         *
         * By default JavaScript links are not allowed and will not pass
         * the Link dialog window validation.
         *
         * @since 4.4.1
         * @cfg {Boolean} [linkJavaScriptLinksAllowed=false]
         * @member CKEDITOR.config
         */
    } );
    
})();