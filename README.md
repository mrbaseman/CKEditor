# CKEditor Developer Edition

## The popular Editor for the WBCE CMS
Includes CKEditor 4.9.0 Full Package and some other Plugins, CKE allows editing content and can be integrated in frontend and backend modules.

CKEditor 4.7.0.1 and later require WBCE 1.2 !!


## WBCE CKEditor FAQ: How to use customization ---

### Question:

What files are there to customize CKEditor for WBCE?

#### Answer:

There are two different configuration files (editor.css and editor.styles.js). All two configuration files can be found in the template folder, please take look inside:

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

All four configuration files are available as default files in _yourinstallation/modules/ckeditor/wb_config

IMPORTANT: Do not change any file of this folder! As they are overwritten with any update of CKEditor module and / or WBCE!


### Question:

How can I customize the CKEditor for WBCE?

#### Answer:

For customizing, copy the files of wb_config to _yourinstallation/templates/_yourdefaulttemplate folder, your changes are only for _yourdefaulttemplate or copy the wb_config to the folder _yourinstallation/templates folder and all changes in config files are for all templates


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
5) _yourinstallation/modules/ckeditor/wb_config/editor.css

editor.styles.js, editor.templates.js and wb_ckconfig.js

1) _yourinstallation/templates/_yourdefaulttemplate/editor.styles.js
2) _yourinstallation/templates/_yourdefaulttemplate/js/editor.styles.js
3) _yourinstallation/templates/_yourdefaulttemplate/editor/editor.styles.js
4) _yourinstallation/templates/wb_config/editor.styles.js
5) _yourinstallation/modules/ckeditor/wb_config/editor.styles.js