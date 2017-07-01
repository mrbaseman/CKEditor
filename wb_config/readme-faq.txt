###################################################

--- WBCE CKEditor FAQ: How to use customization ---

###################################################

# Question: #

What files are there to customize CKEditor for WBCE?

# Answer:   #

There are four different configuration files (editor.css, editor.styles.js, editor.templates.js, wb_ckconfig.js). All four configuration files can be found in the template folder, please take look inside:

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



All four configuration files (wb_ckconfig.js, editor.css, editor.styles.js, editor.templates.js) are available as defaultfiles in _wbinstallation/modules/ckeditor/wb_config

IMPORTANT: Do not change any file of the _wbinstallation/modules/ckeditor/ Directory!! 
As they are overwritten with any update of CKEditor module and / or WBCE. You never have any problems when upgrading CKEditor module to another version.


###################################################

# Question: #

How can I customize the CKEditor for WBCE?

# Answer:   #

For customizing, copy the folder "wb_config." and insert it in one of the two following possibilities:

1) Copy the wb_config to the folder _wbinstallation/templates and all changes in config files are for all templates
2) Copy the wb_config to the folder _wbinstallation/templates/_yourdefaulttemplate rename folder wb_config to editor, your changes are only for _yourdefaulttemplate
	
Change the config files with your FTP-Browser / AddonFileEditor /... 


###################################################

# Question: #

How is the workflow of reading CKEditor files?

# Answer:   #

1) Is called as first if available, 2) is the next one, and so on.

Search order for CKEditor files 

editor.css

1) _wbinstallation/templates/_yourdefaulttemplate/editor.css
2) _wbinstallation/templates/_yourdefaulttemplate/css/editor.css
3) _wbinstallation/templates/_yourdefaulttemplate/editor/editor.css
4) _wbinstallation/templates/wb_config/editor.css
5) _wbinstallation/modules/ckeditor/wb_config/editor.css

editor.styles.js, editor.templates.js, wb_ckconfig.js

1) _wbinstallation/templates/_yourdefaulttemplate/weditor.styles.js
2) _wbinstallation/templates/_yourdefaulttemplate/js/editor.styles.js
3) _wbinstallation/templates/_yourdefaulttemplate/editor/editor.styles.js
4) _wbinstallation/templates/wb_config/editor.styles.js
5) _wbinstallation/modules/ckeditor/wb_config/editor.styles.js