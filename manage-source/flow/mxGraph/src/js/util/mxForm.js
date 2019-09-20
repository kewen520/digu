/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxForm
 * 
 * A simple class for creating HTML forms.
 * 
 * Constructor: mxForm
 * 
 * Creates a HTML table using the specified classname.
 */
function mxForm(className)
{
	this.table = document.createElement('table');
	this.table.className = className;
	this.body = document.createElement('tbody');
	this.table.appendChild(this.body);
};

/**
 * Variable: table
 * 
 * Holds the DOM node that represents the table.
 */
mxForm.prototype.table = null;

/**
 * Variable: body
 * 
 * Holds the DOM node that represents the tbody (table body). New rows
 * can be added to this object using DOM API.
 */
mxForm.prototype.body = false;

/**
 * 自定义DIV
 */
mxForm.prototype.div = null;

/**
 * Function: getTable
 * 
 * Returns the table that contains this form.
 */
mxForm.prototype.getTable = function()
{
	return this.table;
};

/**
 * Function: addButtons
 * 
 * Helper method to add an OK and Cancel button using the respective
 * functions.
 */
mxForm.prototype.addButtons = function(okFunct, cancelFunct)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	td.setAttribute('colspan', 2);
	td.setAttribute('style', 'text-align:center');
	// Adds the ok button
	var button = document.createElement('button');
	mxUtils.write(button, mxResources.get('ok') || 'OK');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
		okFunct();
	});
	
	// Adds the cancel button
	button = document.createElement('button');
	mxUtils.write(button, mxResources.get('cancel') || 'Cancel');
	td.appendChild(button);
	
	mxEvent.addListener(button, 'click', function()
	{
		cancelFunct();
	});
	
	tr.appendChild(td);
	this.body.appendChild(tr);
};

/**
 * Function: addText
 * 
 * Adds an input for the given name, type and value and returns it.
 */
mxForm.prototype.addText = function(name, value, type)
{
	var input = document.createElement('input');
	
	input.setAttribute('type', type || 'text');
	input.value = value;
	
	return this.addField(name, input);
};

/**
 * Function: addCheckbox
 * 
 * Adds a checkbox for the given name and value and returns the textfield.
 */
mxForm.prototype.addCheckbox = function(name, value)
{
	var input = document.createElement('input');
	
	input.setAttribute('type', 'checkbox');
	input.setAttribute('style', 'width:auto;');
	// 暂时不向页面添加,根据需求针对checkBox统一进行处理。
	/*this.addField(name, input);*/

	// IE can only change the checked value if the input is inside the DOM
	if (value)
	{
		input.checked = true;
	}

	return input;
};

/**
 * Function: addTextarea
 * 
 * Adds a textarea for the given name and value and returns the textarea.
 */
mxForm.prototype.addTextarea = function(name, value, rows)
{
	var input = document.createElement('textarea');
	
	if (mxClient.IS_NS)
	{
		rows--;
	}
	
	input.setAttribute('rows', rows || 2);
	input.setAttribute('style', 'width:97%');
	if (name == mxResources.get('keywords') && (typeof value == 'undefined' || value == null || value == '')) {
		input.setAttribute('placeholder', '如有多个答案请以“|”隔开');		
	}
	input.value = value;
	
	return this.addField(name, input);
};

/**
 * Function: addCombo
 * 
 * Adds a combo for the given name and returns the combo.
 */
mxForm.prototype.addCombo = function(name, isMultiSelect, size)
{
	var select = document.createElement('select');
	
	if (size != null)
	{
		select.setAttribute('size', size);
	}
	
	if (isMultiSelect)
	{
		select.setAttribute('multiple', 'true');
	}
	
	return this.addField(name, select);
};

/**
 * Function: addOption
 * 
 * Adds an option for the given label to the specified combo.
 */
mxForm.prototype.addOption = function(combo, label, value, isSelected)
{
	var option = document.createElement('option');
	
	mxUtils.writeln(option, label);
	option.setAttribute('value', value);
	
	if (isSelected)
	{
		option.setAttribute('selected', isSelected);
	}
	
	combo.appendChild(option);
};

/**
 * Function: addField
 * 
 * Adds a new row with the name and the input field in two columns and
 * returns the given input.
 */
mxForm.prototype.addField = function(name, input)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	td.setAttribute('style', 'width:40px;padding-right:10px;');
	mxUtils.write(td, name);
	tr.appendChild(td);
	
	td = document.createElement('td');
	td.appendChild(input);
	tr.appendChild(td);
	this.body.appendChild(tr);
	
	return input;
};
/**
 * 添加话术内容Html元素
 */
mxForm.prototype.addSpeechcraftContentElement = function()
{
	var tr,td;
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.setAttribute('style', 'width:40px;padding:20px 10px 0 0;');
	td.setAttribute('valign', 'top');
	mxUtils.write(td, mxResources.get('content'));
	tr.appendChild(td);
	
	td = document.createElement('td');
	this.div = document.createElement('div');
	this.div.setAttribute('id', '_speechcraftContent');
	this.div.setAttribute('class', 'w-dialog-body');
	this.div.innerHTML = $.utils.loadHTML('speechcraftContent.html');
	td.appendChild(this.div);
	tr.appendChild(td);
	
	this.body.appendChild(tr);
};
/**
 * 添加帮助文档超链接
 */
mxForm.prototype.addHelp = function()
{
	var tr,td;
	tr = document.createElement('tr');
	td = document.createElement('td');
	tr.appendChild(td);
	td = document.createElement('td');
	td.setAttribute('style', 'text-align:left;padding:10px 0;font-size:14px;word-break:keep-all');
	td.innerHTML = "<a href='" + _helpUrl + "#' target='_blank'>点击查看</a>变量参数内容规范及模板";
	tr.appendChild(td);
	
	this.body.appendChild(tr);
};
/**
 * 添加意图编辑器DOM元素
 */
mxForm.prototype.addIntentionEditorElement = function()
{
	var tr,td;
	tr = document.createElement('tr');
	/*td = document.createElement('td');
	td.setAttribute('class', 'intent-left');
	td.setAttribute('valign', 'top');
	mxUtils.write(td, mxResources.get('intentionId'));
	tr.appendChild(td);*/
	
	td = document.createElement('td');
	this.div = document.createElement('div');
	this.div.setAttribute('id', '_intentionEditor');
	this.div.setAttribute('class', 'intention-editor');
	this.div.innerHTML = $.utils.loadHTML('intentionEditor.html');
	td.appendChild(this.div);
	tr.appendChild(td);
	
	this.body.appendChild(tr);
};
/**
 * 添加 Textarea
 */
/*mxForm.prototype.addCustomizedTextarea = function(map)
{
	var tr,td,div,groupDiv,elTabs,elTabPane,elInput,a,span,i,atr;
	
	tr = document.createElement('tr');
	this.body.appendChild(tr);
	
	td = document.createElement('td');
	td.setAttribute('colspan', 2);
	tr.appendChild(td);
	
	this.div = document.createElement('div');
	this.div.setAttribute('id', '_speechcraftContentVue');
	this.div.setAttribute('class', 'w-dialog-body');
	td.appendChild(this.div);
	this.body.appendChild(tr);
	div = document.createElement('div');
//	div.setAttribute('id', '_speechcraftTabs');
	div.setAttribute('class', 'w-dialog-body');
	atr = document.createAttribute('v-cloak');
	div.setAttributeNode(atr);
	
	elTabs = document.createElement('el-tabs');
	elTabs.setAttribute('v-model', 'editableTabsValue');
	elTabs.setAttribute('type', 'card');
	elTabs.setAttribute('v-on:edit', 'handleTabsEdit');
	atr = document.createAttribute('editable');
	elTabs.setAttributeNode(atr);
	this.div.appendChild(elTabs);
	
	elTabPane = document.createElement('el-tab-pane');
	elTabPane.setAttribute('v-for', '(item, index) in editableTabs');
	elTabPane.setAttribute(':key', 'item.name');
	elTabPane.setAttribute(':label', 'item.title');
	elTabPane.setAttribute(':name', 'item.name');
	
	elInput = document.createElement('el-input');
	elInput.setAttribute('v-model', 'item.content');
	elInput.setAttribute('type', 'textarea');
	
	groupDiv = document.createElement('div');
	groupDiv.setAttribute('class', 'w-button-group');
	
	a = document.createElement('a');
	a.setAttribute('v-on:click', 'showUploadRecordDialog()');
	span = document.createElement('span');
	span.textContent = '录音上传';
	i = document.createElement('i');
	i.setAttribute('class', 'icon_play');
	a.appendChild(span);
	span.appendChild(i);
	groupDiv.appendChild(a);
	
	a = document.createElement('a');
	a.setAttribute('v-on:click', '$.utils._dialogVue.videoVisible = true');
	span = document.createElement('span');
	span.textContent = '话术试听';
	i = document.createElement('i');
	i.setAttribute('class', 'icon_record');
	a.appendChild(span);
	span.appendChild(i);
	groupDiv.appendChild(a);
	
	elTabPane.appendChild(elInput);
	elTabPane.appendChild(groupDiv);
	elTabs.appendChild(elTabPane);
	
};*/
/**
 * 添加 checkbox
 * map:checkbox元素map name:obj
 * num:每行几个
 * disableCheckboxs:禁用的checkbox
 */
mxForm.prototype.addCustomizedCheckbox = function(map, num, disableCheckboxs)
{
	var table, body, tr, td;
	var i = 1;
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.setAttribute('colspan', 2);
	table = document.createElement('table');
	table.setAttribute('style', 'width:100%;padding-top: 10px;');
	body = document.createElement('tbody');
	
	table.appendChild(body);
	td.appendChild(table);
	tr.appendChild(td);
	this.body.appendChild(tr);
	
	for ( var key in map) {
		var input = map[key];
		if ((i) % num != 0) {
			tr = document.createElement('tr');
			body.appendChild(tr);
		}
		td = document.createElement('td');
		td.setAttribute('style', 'text-align:left;width:5%');
		if($.inArray(key,disableCheckboxs) >= 0){
			input.setAttribute('disabled', true);
		}
		td.appendChild(input);
		tr.appendChild(td);
		
		td = document.createElement('td');
		td.setAttribute('style', 'text-align:left;width:45%');
		mxUtils.write(td, mxResources.get(key));
		tr.appendChild(td);

		i++;
	}
	
};

mxForm.prototype.addCustomizedCheckboxNew = function(map)
{
	var el_checkbox_group, el_checkbox;
	
	el_checkbox_group = document.createElement('el-checkbox-group');
	el_checkbox_group.setAttribute('v-model', 'checkedList');
	this.div.appendChild(el_checkbox_group);
	
	el_checkbox = document.createElement('el-checkbox');
	el_checkbox.setAttribute('v-for', 'item in checkboxList');
	el_checkbox.setAttribute(':label', 'item');
	el_checkbox.setAttribute(':key', 'item');
	el_checkbox.innerHTML = '{{mxResources.get(item)}}';
	el_checkbox_group.appendChild(el_checkbox);
};
