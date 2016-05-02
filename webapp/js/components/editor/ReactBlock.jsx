'use strict';

import React from 'react';
import update from 'react-addons-update';
import Reflux from 'reflux';
import Actions from 'appRoot/actions';
import {Entity, Editor, EditorState, ContentState} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import ReactD3 from 'react-d3-components';

const {isCtrlKeyCommand, hasCommandModifier} = KeyBindingUtil;

export default React.createClass({
  mixins: [
    Reflux.ListenerMixin      
  ],

  getInitialState: function() {
    let {id, visible, content, output} = this._getValue();
    
    if (content) {
      var parsedCode = JSON.parse(content);
      var layoutOptions = parsedCode['layout'];
      var chartOptions = parsedCode['chart'];
      var type = chartOptions['type'];
      // var type = parsedCode['type'];
      // var dataSet = output.props.data[0].values;
      var dataSet = output;
      output = this.renderChart(type, layoutOptions, chartOptions, dataSet, true);
    }
    else {
      output = null;
    }

    return {
      id: id,
      editMode: false,
      visible: visible,
      content: content,
      editorState: EditorState.createWithContent(
        ContentState.createFromText(content)
      ),
      output: output
    };
  },

  componentWillMount: function() {
    // let id = Entity
    //     .get(this.props.block.getEntityAt(0))
    //     .getData()['id'];
    let id = this.state.id;
    this.listenTo(Actions.sendMsgWS.completed, function(blockId, msg) {
        if (blockId == id) {
            console.log("actions.sendWS completed");
            console.log(msg);
        }
    });
    this.listenTo(Actions.receiveMsgWS, function(blockId, response) {
        if (blockId == id) {
            console.log("actions.receiveMsgWS: ");
            console.log(response);
            this.setState({output: response.output});
        }
    });
  },

  _getValue: function() {
    let id = Entity
        .get(this.props.block.getEntityAt(0))
        .getData()['id'];
    let visible = Entity
        .get(this.props.block.getEntityAt(0))
        .getData()['visible'];
    let content = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
    let output = Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['output'];
    return {id: id, visible: visible, content: content, output: output};
  },

  _onBlur: function() {
    // if (this.state.editMode) {
      var outputData = null;
      if (this.state.output) {
        console.log("_onBlur");
        console.log(this.state.output);
        // outputData = this.state.output.props.data[0].values
        outputData = this.state.output.props.children.props.data[0].values
      }
      var entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {
        visible: this.state.visible,
        content: this.state.content,
        // output: this.state.output
        output: outputData
      });
      this.setState({
        editMode: false
      }, this._finishEdit(this.state.id));
    // }
  },

  _onClick: function(e) {
    e.stopPropagation();
    this.props.blockProps.onBlurCallback(this.state.id, this._onBlur);
    if (this.state.visible) {
      if (this.state.editMode) {
        return;
      } else {
        this.setState({
          editMode: true,
          // content: content,
          // output: output
        }, () => {
          this._startEdit(this.state.id);
          setTimeout(() => this.refs.editor2.focus(), 0);
        });
      }
    } else {
      let {id, visible, content, output} = this._getValue();
      this.setState({
          editMode: false,
          visible: true,
          content: content
        });
    }
  },

  _onEditorChange: function(editorState) {
    var value = editorState.getCurrentContent().getPlainText();
    this.setState({
      content: value,
      editorState: editorState
    });
  },

  _save: function(e) {
    e.stopPropagation();
    var outputData = null;
    if (this.state.output) {
      // outputData = this.state.output.props.data[0].values
      outputData = this.state.output.props.children.props.data[0].values
    }
    var entityKey = this.props.block.getEntityAt(0);
    Entity.mergeData(entityKey, {
      visible: false,
      content: this.state.content,
      // output: this.state.output
      output: outputData
    });
    this.setState({
      editMode: false,
      visible: false
    }, this._finishEdit);
  },

  _remove: function() {
    this.props.blockProps.onRemove(this.props.block.getKey());
  },

  _startEdit: function() {
    this.props.blockProps.onStartEdit(this.props.block.getKey());
  },

  _finishEdit: function() {
    this.props.blockProps.onFinishEdit(this.props.block.getKey());
  },

  _customKeyBindingFn: function(e: SyntheticKeyboardEvent): string {
    return getDefaultKeyBinding(e);
  },

  _handleKeyCommand: function(command) {
    
  },

  renderChart: function(type, layoutOptions, chartOptions, data, stored) {
    if (type == 'barChart') {
      var xVariableName = chartOptions['xVariableName'];
      var yVariableName = chartOptions['yVariableName'];
      var width = chartOptions['width'];
      var height = chartOptions['height'];
      var label = chartOptions['label'];
      var margin = chartOptions['margin'];

      var chartData;
      if (!stored) {
        var values = data.map(function(e) {
          return {x: e[xVariableName], y: e[yVariableName]};
        });

        var chartData = [{
          label: label,
          values: values
        }];
      } else {
        chartData = [{
          label: label,
          values: data
        }];;
      }
      
      var BarChart = ReactD3.BarChart;
      console.log(layoutOptions);
      var output =
        <div style={layoutOptions}>
          <BarChart
              data={chartData}
              width={width}
              height={height}
              margin={margin}
          />
        </div>
      return output;
    }
  },

  _handleReturn: function(e) {
    if (e.keyCode === 13 /* `Enter` key */ && isCtrlKeyCommand(e)) {
      var content = this.state.content;
      var parsedCode = JSON.parse(content);
      var layoutOptions = parsedCode['layout'];
      var chartOptions = parsedCode['chart'];
      var type = chartOptions['type'];
      var variable = chartOptions['dataSet'];
      var dataSet = window[variable];
      var output = this.renderChart(type, layoutOptions, chartOptions, dataSet, false);

      this.setState(
        update(this.state, {
          output: { $set: output }
        })
      );
      return true;
    }
  },

  render() {
    var editPanelClassName = 'editor-code-edit-panel '
    var outputClassName = 'editor-code-output';
    var buttonClass = 'TeXEditor-saveButton';
    if (this.state.editMode) {

      editPanelClassName = 'editor-code-edit-panel';
      outputClassName = 'editor-code-output editor-code-disabled';
    }
    else {
      editPanelClassName = 'editor-code-edit-panel editor-code-disabled';
      outputClassName = 'editor-code-output';
    }
    var editPanel =
      <div className={editPanelClassName}
            style={
                this.state.visible ?
                {} :
                {display: 'none'}
              }>
        <div className="TeXEditor-buttons">
          <button
            className={buttonClass}
            onClick={this._save}>
            Done
          </button>
          <button className="TeXEditor-removeButton" onClick={this._remove}>
            Remove
          </button>
        </div>
        <Editor
            className="editor-code-editor"
            editorState={this.state.editorState}
            handleKeyCommand={this._handleKeyCommand}
            handleReturn={this._handleReturn}
            keyBindingFn={this._customKeyBindingFn}
            onChange={this._onEditorChange}
            placeholder="React block. Start writing..."
            readOnly={!this.state.editMode}
            ref="editor2"
          />
      </div>;

    return (
      <div className="editor-code-component" onClick={this._onClick} >
        {editPanel}
        
        <div className={outputClassName}>
          {this.state.output}
        </div>
      </div>
    );
  }
});