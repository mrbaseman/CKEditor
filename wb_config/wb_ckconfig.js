/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config )
{
    /* Protect PHP code tags (<?...?>) so CKEditor will not break them when switching from Source to WYSIWYG.
     * Uncommenting this line doesn't mean the user will not be able to type PHP code in the source.
     * This kind of prevention must be done in the server side, so just leave this line as is. */
    config.protectedSource.push(/<\?[\s\S]*?\?>/g); // PHP Code

    //disable ckes Advanced Content Filter (ACF) to avoid wblinks to be filtered?
    config.allowedContent = true;
};