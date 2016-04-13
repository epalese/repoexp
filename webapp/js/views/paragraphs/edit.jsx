"use strict";

import React        from 'react';
import { History }  from 'react-router';
import update       from 'react-addons-update';
import Reflux       from 'reflux';
import Actions      from 'appRoot/actions';
import Loader       from 'appRoot/components/loader';
import marked       from 'marked';
import NotebookStore        from 'appRoot/stores/notebooks';
import {Chart, Bar, XYAxis} from 'appRoot/components/charts';


export default React.createClass({
    mixins: [
        Reflux.ListenerMixin
    ],

    getInitialState: function() {
        return {paragraphs: this.props.paragraphs};
    },
    componentWillMount: function() {
        this.listenTo(Actions.sendMsgWS.completed, function(paragraphId, msg) {
            if (paragraphId == this.state.paragraphs.id) {
                console.log("actions.sendWS completed");
                console.log(msg);
                // this.setState({ notebook: notebook, loading: false });
                // update the paragraph to notify that the message has been sent
                // and we are waiting for an anwer
            }
        });
        this.listenTo(Actions.receiveMsgWS, function(paragraphId, response) {
            if (paragraphId == this.state.paragraphs.id) {
                console.log("actions.receiveMsgWS: ");
                console.log(response);
                this.setState({paragraphs: response});
            }
        });
        this.editMode = this.props.hasOwnProperty('paragraphId');
        if (this.editMode) {
            // check the paragraph type and process the output
            // in case of react type
            var p = this.state.paragraphs;
            if (this.state.paragraphs.type == 'react') {
                var checked_output;
                try {
                    checked_output = eval.call(this, this.state.paragraphs.output);
                } catch(e) {
                    checked_output = e.toString();
                };
                p.output = checked_output;
            }
            this.setState({paragraphs: p});
        }
    },
    codeChange: function(e) {
        this.setState(
            update(this.state, {
                paragraphs: { 
                    code: { $set: e.target.value }
                }
            })
        );
    },
    keyDown: function(e) {
        if (e.which == 13 & e.ctrlKey) {
            e.preventDefault();
            if (this.state.paragraphs.type == 'markdown') {
                console.log("keydown markdown code = " + this.state.paragraphs.code);
                this.setState(
                    update(this.state, {
                        paragraphs: { 
                            output: { $set: this.state.paragraphs.code }
                        }
                    })
                );
            }
            else if (this.state.paragraphs.type == 'react') {
                this.setState(
                    update(this.state, {
                        paragraphs: { 
                            output: { $set: this.state.paragraphs.code }
                        }
                    })
                );
            }
            else if (this.state.paragraphs.type == 'react-chart') {
                // var data = [
                //     {x:100, y:10},
                //     {x:200, y:20},
                //     {x:300, y:30}
                // ];

                var data = [
                    {cibo:"sugo pronto", y:10},
                    {cibo:"minestrone", y:20},
                    {cibo:"panzerotti", y:30}

                    // {"Supplier":"STUDENT LOANS COMPANY LIMITED","Tot_Amount":1.358617829E9},
                    // {"Supplier":"POST OFFICE LTD","Tot_Amount":8.509302669301758E8},
                    // {"Supplier":"HIGHER EDUCATION FUNDING COUNCIL FOR ENGLAND","Tot_Amount":4.85789888E8},
                    // {"Supplier":"SKILLS FUNDING AGENCY","Tot_Amount":2.6444E8},
                    // {"Supplier":"ENGINEERING AND PHYSICAL SCIENCES RESEARCH COUNCIL","Tot_Amount":1.918E8},
                    // {"Supplier":"BIOTECHNOLOGY AND BIOLOGICAL SCIENCE RESEARCH COUNCIL","Tot_Amount":8.95E7}

                ];
                

                var output =
                    <div>
                        <Chart width="400"
<<<<<<< HEAD
                                height="400">
                            <Bar data={data}
                                x_axis_variable="cibo"
                                y_axis_variable="y"
                                width="350"
                                height="350"
                                margin_left="10"
                                margin_right="10"
                                margin_top="10"
                                margin_bottom="10" />
                            <XYAxis data={data}
                                x_axis_variable="cibo"
                                y_axis_variable="y"
                                width="350"
                                height="350"
                                margin_left="10"
                                margin_right="10"
                                margin_top="10"
                                margin_bottom="10" />
=======
                               height="400">
                          <Bar data={data}
                              width="400"
                              height="400" 
                              x_axis="Supplier"
                              y_axis="Tot_Amount" />
>>>>>>> 1c865aa3686f3840b675422def7bf5a645a4be06
                        </Chart>
                    </div>
                this.setState(
                    update(this.state, {
                        paragraphs: { 
                            output: { $set: output }
                        }
                    })
                );
            }
            else if (this.state.paragraphs.type == 'code') {
                var msg = {id: this.props.paragraphId, type: 'code', content: this.state.paragraphs.code};
                Actions.sendMsgWS(this.state.paragraphs.id, msg).then(function() {
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
        // console.log(this.state);
        if (this.state.paragraphs.type == 'markdown') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
                        
                    </div>
                </div> 

        }
        else if (this.state.paragraphs.type == 'react') {
            var checked_output;
            try {
                checked_output = eval.call(this, this.state.paragraphs.output);
                // checked_output = eval.call(objectA, this.state.paragraph.output);
                // var jsCode = Babel.transform(this.state.paragraphs.output);
                // checked_output = eval(jsCode.code);
            } catch(e) {
                checked_output = e.toString();
            };
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{checked_output}</div>
                    </div>
                </div>
        }
        else if (this.state.paragraphs.type == 'react-chart') {
            // var checked_output;
            // try {
            //     checked_output = eval.call(this, this.state.paragraphs.output);
            //     // checked_output = eval.call(objectA, this.state.paragraph.output);
            //     // var jsCode = Babel.transform(this.state.paragraphs.output);
            //     // checked_output = eval(jsCode.code);
            // } catch(e) {
            //     checked_output = e.toString();
            // };
            console.log(this.state.paragraphs.output);
            p = 
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div>{this.state.paragraphs.output}</div>
                    </div>
                </div>
        }
        else if (this.state.paragraphs.type == 'code') {
            p =
                <div className="paragraph">
                    <div className="paragraph-title">
                        <h2 >
                            Paragraph {this.state.paragraphs.id}: {this.state.paragraphs.type}
                        </h2>
                    </div>
                    <div className="paragraph-code">
                        <textArea
                            onChange={this.codeChange}
                            onKeyDown={this.keyDown}
                            value={this.state.paragraphs.code} >
                        </textArea>
                    </div>
                    <div className="paragraph-output">
                        <div dangerouslySetInnerHTML={this.rawMarkup(this.state.paragraphs.output)} />
                    </div>
                </div> 
        }

        return p;
    }
});
