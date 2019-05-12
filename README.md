# CKEditor Developer Edition

## The popular Editor for the WBCE CMS
Includes CKEditor 4.11.4 Full Package and some other Plugins, CKE allows editing content and can be integrated in modules.

***CKEditor 4.7.0.1 and later require WBCE 1.2 !***


## FAQ: Customizing CKEditor

### Question:

What files are there to customize CKEditor for WBCE?

#### Answer:

+ editor.css:	
The default look of the WYSIWYG textarea and the preview.

+ editor.styles.js:
The default styles you can choose from a dropdown in the CKEditor toolbar.

+ editor.templates.js:
The default CKE templates you can choose of a button in CKEditor toolbar.
Please note: We recommend not to use CKE templates, because the WBCE template should define the different blocks and the template.

+ wb_ckconfig.js:
Here are most of the configuration issues defined.
Toolbar-Configuration, behavior on Enter / Shift+Enter, default language and so on.

The configuration files could already be in the template folder, please take a look inside:

### Question:

How can I customize the CKEditor for WBCE?

#### Answer:

For customizing, copy the files of wb_config to _yourinstallation/templates/_yourdefaulttemplate folder, your changes are only for _yourdefaulttemplate.
Or copy the wb_config to _yourinstallation/templates folder and all changes are for all templates.

### Question:

How is the workflow of reading CKEditor files?

#### Answer:

1) Is called as first if available, 2) Is the next one, and so on!

Search order for configuration files 

editor.css

1) _yourinstallation/templates/_yourdefaulttemplate/editor.css
2) _yourinstallation/templates/_yourdefaulttemplate/css/editor.css
3) _yourinstallation/templates/_yourdefaulttemplate/editor/editor.css
4) _yourinstallation/templates/wb_config/editor.css
5) _yourinstallation/modules/ckeditor/ckeditor/contents.css

editor.styles.js

1) _yourinstallation/templates/_yourdefaulttemplate/editor.styles.js
2) _yourinstallation/templates/_yourdefaulttemplate/js/editor.styles.js
3) _yourinstallation/templates/_yourdefaulttemplate/editor/editor.styles.js
4) _yourinstallation/templates/wb_config/editor.styles.js
5) _yourinstallation/modules/ckeditor/ckeditor/styles.js

wb_ckconfig.js

1) _yourinstallation/templates/_yourdefaulttemplate/editor.styles.js
2) _yourinstallation/templates/_yourdefaulttemplate/js/editor.styles.js
3) _yourinstallation/templates/_yourdefaulttemplate/editor/editor.styles.js
4) _yourinstallation/templates/wb_config/editor.styles.js
5) _yourinstallation/modules/ckeditor/ckeditor/styles.js

editor.templates.js

1) _yourinstallation/templates/_yourdefaulttemplate/editor.templates.js
2) _yourinstallation/templates/_yourdefaulttemplate/js/editor.templates.js
3) _yourinstallation/templates/_yourdefaulttemplate/editor/editor.templates.js
4) _yourinstallation/templates/wb_config/editor.templates.js
5) _yourinstallation/modules/ckeditor/wb_config/editor.templates.js