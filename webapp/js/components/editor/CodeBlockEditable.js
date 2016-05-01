'use strict';

import React from 'react';
import update from 'react-addons-update';
import {Editor, Entity, EditorBlock} from 'draft-js';

export default class CodeBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      visible: false
    };
  }
  
  render() {
    return (
      <div className="editor-code-panel" >
        <div className="editor-buttons" data-offset-key={this.props.offsetKey}>
           <EditorBlock {...this.props} />
            <Editor
              blockRendererFn={this._blockRenderer}
              editorState={this.state.editorState}
              handleKeyCommand={this._handleKeyCommand}
              keyBindingFn={customKeyBindingFn}
              onChange={this._onChange}
              placeholder="Start a document..."
              readOnly={this.state.liveComponentEdits.count()}
              ref="editor"
              spellCheck={true}
            />
        </div>
      </div>
    );
  }
}