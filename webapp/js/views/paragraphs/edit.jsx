"use strict";

import React        from 'react';
import { History }  from 'react-router';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import marked       from 'marked';
import NotebookStore    from 'appRoot/stores/notebooks';

export default React.createClass({
    // mixins: [Reflux.ListenerMixin],
    // mixins: [Reflux.connectFilter(NotebookStore, "paragraphs", function(paragraphs) {
    //     return paragraphs.filter(function(paragraph) {
    //         console.log("mixins: paragraph_id = " + paragraph.id)
    //         return paragraph.id === this.props.paragraph.id;
    //     }.bind(this)
    //     )[0];
    // })],

    getInitialState: function() {
        console.log("getInitialState");
        console.log(this.props.paragraph);
        // return { paragraph: this.props.paragraph };
        return { paragraph: {} };
    },
    componentWillMount: function() {
        this.listenTo(Actions.sendWS.completed, function(response) {
            console.log("actions.sendWS completed");
            console.log(response);
            // this.setState({ notebook: notebook, loading: false });
        });
        this.editMode = this.props.hasOwnProperty('paragraphId');
        if (this.editMode) {
            // check the paragraph type and process the output
            // in case of react type
            var p = this.props.paragraph;
            if (this.props.paragraph.type == 'react') {
                var checked_output;
                try {
                    checked_output = eval.call(this, this.props.paragraph.output); 
                } catch(e) {
                    checked_output = e.toString();
                };
                p.output = checked_output;
            }

            this.setState({ paragraph: p});
        }
    },
    codeChange: function(e) {
        this.setState(
            update(this.state, {
                paragraph: { 
                    code: { $set: e.target.value }
                }
            })
        );
    },
    keyDown: function(e) {
        if (e.which == 13 & e.ctrlKey) {
            e.preventDefault();
            if (this.state.paragraph.type == 'markdown') {
                console.log("keydown markdown code = " + this.state.paragraph.code);
                this.setState(
                    update(this.state, {
                        paragraph: { 
                            output: { $set: this.state.paragraph.code }
                        }
                    })
                );
            }
            else if (this.state.paragraph.type == 'react') {
                console.log("keydown react code = ");
                this.setState(
                    update(this.state, {
                        paragraph: { 
                            output: { $set: this.state.paragraph.code }
                        }
                    })
                );
            }
            else if (this.state.paragraph.type == 'code') {
                console.log("keydown code");
                console.log("keydown code: code = " + this.state.paragraph.code);
                var msg = {id: this.props.paragraphId, type: 'code', content: this.state.paragraph.code};
                Actions.sendMsgWS(msg).then(function() {
                    // signal that the message has been sent 
                    // and the server is processing the request
                    console.log("Message sent and under processing...");
                });
            }
        }
    },
    rawMarkup: function(html) {
        var rawMarkup = marked(
            html,
            {sanitize: true}
            );
        return {__html: rawMarkup};
    },
    render: function() {
        var p = null;

        if (this.state.paragraph.type == 'markdown') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraph.id}: {this.state.paragraph.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraph.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>this.state.paragraph.output</div>
                    </div>
                </div> 

        }
        else if (this.state.paragraph.type == 'react') {
            var checked_output;
            try {
                checked_output = eval.call(null, this.state.paragraph.output);
                // checked_output = eval.call(objectA, this.state.paragraph.output);
            } catch(e) {
                checked_output = e.toString();
            };
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraph.id}: {this.state.paragraph.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraph.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{checked_output}</div>
                    </div>
                </div>
        }
        else if (this.state.paragraph.type == 'code') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraph.id}: {this.state.paragraph.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraph.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraph.output)} />
                    </div>
                </div> 
        }

        return p;
    }
});
