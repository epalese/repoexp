'use strict';

import React from 'react';
import update from 'react-addons-update';
import {Entity, EditorBlock} from 'draft-js';

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
        </div>
      </div>
    );
  }
}