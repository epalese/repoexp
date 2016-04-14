"use strict";

import React        from 'react';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Moment       from 'moment';
import Config       from 'appRoot/appConfig';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import BasicInput   from 'appRoot/components/basicInput';
import ParagraphEdit from 'appRoot/views/paragraphs/edit';


export default React.createClass({
    mixins: [Reflux.ListenerMixin],

    getInitialState: function () {
        return { loading: true, validity: {}, notebook: {} };
    },
    componentWillMount: function () {
        this.editMode   = this.props.params.hasOwnProperty('notebookId');
        this.createMode = !this.editMode;
        this.notebookId = this.editMode ? this.props.params.notebookId : null;
        this.setState({ loading: this.editMode ? true : false });

        // console.log("componentWillMount: editMode = " + this.editMode);
        if (this.editMode) {
            // console.log("componentWillMount: id = " + this.notebookId);
            this.listenTo(Actions.getNotebook.completed, function(notebook) {
                // console.log("actions.getNotebook returned");
                this.setState({ notebook: notebook, loading: false });
            });
            Actions.getNotebook(this.notebookId);
        }
    },
    componentDidMount: function () {
        // var newPostTmpl = '<div>Hello World!</div><div><b>This</b> is my story...</div><div><br/></div>';
        // !this.editMode && this.initQuill(newPostTmpl);
    },
    
    submit: function (e) {
    },

    titleChange: function (e) {
        this.setState(update(this.state, { 
            notebook: { 
                title: { $set: e.target.value }
            }
        }));
    },
    // form parts of component is always the same so render won't diff
    render: function () {
        var paragraphsUI = this.state.notebook.paragraphs ?
            this.state.notebook.paragraphs.map(
                function (paragraph) {
                    return (<ParagraphEdit key={paragraph.id}
                                paragraphId={paragraph.id}
                                paragraphs={paragraph} />);
                }
                )
            : [];
        return (
            <div>
                <BasicInput 
                    type="text" 
                    ref="title" 
                    name="title" 
                    value={this.state.notebook.name}
                    error={this.state.validity.name}
                    onChange={this.titleChange}
                    placeholder="notebook title"  
                />
                <div id="help">
                Select a paragraph and then press CTRL+ENTER to execute.
                Wait to see the output in the area below the paragraph.
                </div>
                <div>
                    {paragraphsUI}
                </div>
            </div>
            
        );
    }
});
